#!/usr/bin/env python3
"""
Script para preencher automaticamente informações faltantes em Venues e Producers
e baixar imagens relacionadas.

Uso:
    python scripts/fill-missing-info.py --type venues
    python scripts/fill-missing-info.py --type producers
    python scripts/fill-missing-info.py --type all --limit 10
"""

import json
import os
import sys
import argparse
import requests
import time
from typing import Dict, List, Optional, Any
from urllib.parse import quote, urlparse
import re
from pathlib import Path

# Tentar importar BeautifulSoup se disponível
try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False
    print("⚠️  BeautifulSoup4 não instalado. Instale com: pip install beautifulsoup4 lxml")

# Configurações
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
IMAGES_DIR = BASE_DIR / "public" / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Headers para requests
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# APIs (configurar via variáveis de ambiente)
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "")
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY", "")
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "")


class MissingInfoFiller:
    """Classe principal para preencher informações faltantes"""
    
    def __init__(self, entity_type: str = "all"):
        self.entity_type = entity_type
        self.stats = {
            "processed": 0,
            "updated": 0,
            "errors": 0,
            "fields_filled": {}
        }
    
    def load_data(self) -> Dict[str, List[Dict]]:
        """Carrega dados do sistema (JSON export ou API)"""
        data = {"venues": [], "producers": []}
        
        # Tentar carregar de arquivo JSON exportado
        venues_file = DATA_DIR / "venues_export.json"
        producers_file = DATA_DIR / "producers_export.json"
        
        if venues_file.exists():
            with open(venues_file, "r", encoding="utf-8") as f:
                data["venues"] = json.load(f)
        
        if producers_file.exists():
            with open(producers_file, "r", encoding="utf-8") as f:
                data["producers"] = json.load(f)
        
        return data
    
    def save_data(self, data: Dict[str, List[Dict]]):
        """Salva dados atualizados"""
        if "venues" in data:
            with open(DATA_DIR / "venues_updated.json", "w", encoding="utf-8") as f:
                json.dump(data["venues"], f, indent=2, ensure_ascii=False)
        
        if "producers" in data:
            with open(DATA_DIR / "producers_updated.json", "w", encoding="utf-8") as f:
                json.dump(data["producers"], f, indent=2, ensure_ascii=False)
    
    def get_missing_fields(self, entity: Dict, entity_type: str) -> List[str]:
        """Identifica campos faltantes baseado na prioridade"""
        missing = []
        
        if entity_type == "venue":
            high_priority = ["contactPhone", "contactEmail", "contactName"]
            medium_priority = ["capacity", "url", "city", "cae", "lat", "lng"]
            low_priority = ["country", "region", "photoUrl"]
            
            for field in high_priority + medium_priority + low_priority:
                if not entity.get(field):
                    missing.append(field)
        
        elif entity_type == "producer":
            high_priority = ["contactPhone", "contactEmail", "contactName"]
            medium_priority = ["city", "url", "producerType", "specialties"]
            low_priority = ["country", "region", "photoUrl"]
            
            for field in high_priority + medium_priority + low_priority:
                if not entity.get(field):
                    missing.append(field)
        
        return missing
    
    def search_google_places(self, name: str, city: str = None) -> Optional[Dict]:
        """Busca informações no Google Places API"""
        if not GOOGLE_PLACES_API_KEY:
            return None
        
        try:
            query = name
            if city:
                query += f" {city}"
            
            url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
            params = {
                "query": query,
                "key": GOOGLE_PLACES_API_KEY,
                "language": "pt"
            }
            
            response = requests.get(url, params=params, headers=HEADERS, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("results") and len(data["results"]) > 0:
                    place = data["results"][0]
                    
                    # Buscar detalhes completos
                    place_id = place.get("place_id")
                    if place_id:
                        details_url = "https://maps.googleapis.com/maps/api/place/details/json"
                        details_params = {
                            "place_id": place_id,
                            "key": GOOGLE_PLACES_API_KEY,
                            "language": "pt",
                            "fields": "name,formatted_phone_number,international_phone_number,website,formatted_address,geometry,photos"
                        }
                        details_response = requests.get(details_url, params=details_params, headers=HEADERS, timeout=10)
                        if details_response.status_code == 200:
                            return details_response.json().get("result")
            
            time.sleep(0.2)  # Rate limiting
        except Exception as e:
            print(f"  ⚠️  Erro ao buscar Google Places: {e}")
        
        return None
    
    def geocode_address(self, name: str, city: str = None, address: str = None) -> Optional[Dict]:
        """Geocodifica endereço usando Nominatim (OpenStreetMap)"""
        try:
            query = name
            if address:
                query = address
            elif city:
                query += f", {city}, Portugal"
            else:
                query += ", Portugal"
            
            url = "https://nominatim.openstreetmap.org/search"
            params = {
                "q": query,
                "format": "json",
                "limit": 1,
                "countrycodes": "pt"
            }
            
            response = requests.get(url, params=params, headers=HEADERS, timeout=10)
            if response.status_code == 200:
                results = response.json()
                if results:
                    result = results[0]
                    return {
                        "lat": float(result.get("lat", 0)),
                        "lng": float(result.get("lon", 0)),
                        "address": result.get("display_name", "")
                    }
            
            time.sleep(1)  # Rate limiting do Nominatim
        except Exception as e:
            print(f"  ⚠️  Erro ao geocodificar: {e}")
        
        return None
    
    def scrape_website(self, url: str) -> Optional[Dict]:
        """Faz scraping básico de um website para extrair informações"""
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            if response.status_code == 200:
                html = response.text
                info = {}
                
                # Usar BeautifulSoup se disponível para parsing melhor
                if HAS_BS4:
                    soup = BeautifulSoup(html, 'lxml')
                    
                    # Extrair email de links mailto:
                    mailto_links = soup.find_all('a', href=re.compile(r'^mailto:'))
                    if mailto_links:
                        email = mailto_links[0]['href'].replace('mailto:', '').split('?')[0]
                        info["contactEmail"] = email
                    
                    # Extrair telefone de links tel:
                    tel_links = soup.find_all('a', href=re.compile(r'^tel:'))
                    if tel_links:
                        phone = tel_links[0]['href'].replace('tel:', '').replace(' ', '').replace('-', '')
                        if not phone.startswith('+351') and len(phone) == 9:
                            phone = "+351" + phone
                        info["contactPhone"] = phone
                    
                    # Buscar imagens principais (não ícones/logos)
                    images = soup.find_all('img', src=True)
                    for img in images:
                        src = img.get('src', '')
                        alt = img.get('alt', '').lower()
                        # Filtrar imagens válidas
                        if any(ext in src.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                            if not any(x in src.lower() for x in ['icon', 'logo', 'avatar', 'tracking', 'pixel']):
                                if not any(x in alt for x in ['icon', 'logo', 'avatar']):
                                    # Converter URL relativa para absoluta
                                    if not src.startswith('http'):
                                        base_url = f"{urlparse(url).scheme}://{urlparse(url).netloc}"
                                        src = base_url + (src if src.startswith('/') else '/' + src)
                                    info["photoUrl"] = src
                                    break
                
                # Fallback para regex se BeautifulSoup não disponível
                if not info.get("contactEmail"):
                    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
                    emails = re.findall(email_pattern, html)
                    if emails:
                        valid_emails = [e for e in emails if not any(
                            x in e.lower() for x in ['tracking', 'analytics', 'noreply', 'no-reply']
                        )]
                        if valid_emails:
                            info["contactEmail"] = valid_emails[0]
                
                if not info.get("contactPhone"):
                    phone_patterns = [
                        r'\+351\s?\d{9}',
                        r'00351\s?\d{9}',
                        r'\d{3}\s?\d{3}\s?\d{3}',
                        r'\d{9}'
                    ]
                    for pattern in phone_patterns:
                        phones = re.findall(pattern, html)
                        if phones:
                            phone = phones[0].replace(" ", "").replace("-", "")
                            if phone.startswith("00351"):
                                phone = "+351" + phone[5:]
                            elif not phone.startswith("+351") and len(phone) == 9:
                                phone = "+351" + phone
                            info["contactPhone"] = phone
                            break
                
                if not info.get("photoUrl"):
                    img_pattern = r'<img[^>]+src=["\']([^"\']+)["\']'
                    images = re.findall(img_pattern, html)
                    if images:
                        valid_images = [
                            img for img in images 
                            if any(ext in img.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp'])
                            and not any(x in img.lower() for x in ['icon', 'logo', 'avatar', 'tracking'])
                        ]
                        if valid_images:
                            base_url = f"{urlparse(url).scheme}://{urlparse(url).netloc}"
                            img_url = valid_images[0]
                            if not img_url.startswith('http'):
                                img_url = base_url + (img_url if img_url.startswith('/') else '/' + img_url)
                            info["photoUrl"] = img_url
                
                return info if info else None
                
        except Exception as e:
            print(f"  ⚠️  Erro ao fazer scraping: {e}")
        
        return None
    
    def download_image(self, url: str, entity_id: str, entity_type: str) -> Optional[str]:
        """Baixa imagem e salva localmente"""
        try:
            response = requests.get(url, headers=HEADERS, timeout=15, stream=True)
            if response.status_code == 200:
                # Determinar extensão
                content_type = response.headers.get('content-type', '')
                ext = 'jpg'
                if 'png' in content_type:
                    ext = 'png'
                elif 'webp' in content_type:
                    ext = 'webp'
                
                # Nome do arquivo
                filename = f"{entity_type}_{entity_id}.{ext}"
                filepath = IMAGES_DIR / filename
                
                # Salvar imagem
                with open(filepath, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                # Retornar caminho relativo
                return f"/images/{filename}"
        except Exception as e:
            print(f"  ⚠️  Erro ao baixar imagem: {e}")
        
        return None
    
    def search_image_unsplash(self, query: str) -> Optional[str]:
        """Busca imagem no Unsplash"""
        if not UNSPLASH_ACCESS_KEY:
            return None
        
        try:
            url = "https://api.unsplash.com/search/photos"
            params = {
                "query": query,
                "per_page": 1,
                "orientation": "landscape"
            }
            headers = {
                **HEADERS,
                "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("results") and len(data["results"]) > 0:
                    return data["results"][0]["urls"]["regular"]
            
            time.sleep(0.1)
        except Exception as e:
            print(f"  ⚠️  Erro ao buscar Unsplash: {e}")
        
        return None
    
    def search_image_pexels(self, query: str) -> Optional[str]:
        """Busca imagem no Pexels"""
        if not PEXELS_API_KEY:
            return None
        
        try:
            url = "https://api.pexels.com/v1/search"
            params = {
                "query": query,
                "per_page": 1,
                "orientation": "landscape"
            }
            headers = {
                **HEADERS,
                "Authorization": PEXELS_API_KEY
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("photos") and len(data["photos"]) > 0:
                    return data["photos"][0]["src"]["large"]
            
            time.sleep(0.1)
        except Exception as e:
            print(f"  ⚠️  Erro ao buscar Pexels: {e}")
        
        return None
    
    def fill_venue_info(self, venue: Dict) -> Dict:
        """Preenche informações faltantes de um venue"""
        missing = self.get_missing_fields(venue, "venue")
        if not missing:
            return venue
        
        print(f"\n📍 Processando: {venue.get('name', 'Sem nome')}")
        print(f"   Faltam {len(missing)} campo(s): {', '.join(missing)}")
        
        updates = {}
        
        # Buscar no Google Places
        if any(f in missing for f in ["contactPhone", "contactEmail", "url", "lat", "lng"]):
            place_info = self.search_google_places(
                venue.get("name", ""),
                venue.get("city")
            )
            
            if place_info:
                if "contactPhone" in missing and place_info.get("formatted_phone_number"):
                    updates["contactPhone"] = place_info["formatted_phone_number"]
                    self.stats["fields_filled"]["contactPhone"] = self.stats["fields_filled"].get("contactPhone", 0) + 1
                
                if "url" in missing and place_info.get("website"):
                    updates["url"] = place_info["website"]
                    self.stats["fields_filled"]["url"] = self.stats["fields_filled"].get("url", 0) + 1
                
                if "lat" in missing or "lng" in missing:
                    geometry = place_info.get("geometry", {})
                    location = geometry.get("location", {})
                    if location.get("lat") and location.get("lng"):
                        updates["lat"] = location["lat"]
                        updates["lng"] = location["lng"]
                        self.stats["fields_filled"]["location"] = self.stats["fields_filled"].get("location", 0) + 1
                
                if "address" in missing and place_info.get("formatted_address"):
                    updates["address"] = place_info["formatted_address"]
        
        # Geocodificação alternativa
        if ("lat" in missing or "lng" in missing) and not updates.get("lat"):
            geo_info = self.geocode_address(
                venue.get("name", ""),
                venue.get("city"),
                venue.get("address")
            )
            if geo_info:
                if "lat" in missing:
                    updates["lat"] = geo_info["lat"]
                if "lng" in missing:
                    updates["lng"] = geo_info["lng"]
                if "address" in missing and not venue.get("address"):
                    updates["address"] = geo_info["address"]
        
        # Scraping do website
        url = updates.get("url") or venue.get("url")
        if url and any(f in missing for f in ["contactEmail", "contactPhone", "photoUrl"]):
            scraped = self.scrape_website(url)
            if scraped:
                if "contactEmail" in missing and scraped.get("contactEmail"):
                    updates["contactEmail"] = scraped["contactEmail"]
                    self.stats["fields_filled"]["contactEmail"] = self.stats["fields_filled"].get("contactEmail", 0) + 1
                
                if "contactPhone" in missing and scraped.get("contactPhone"):
                    updates["contactPhone"] = scraped["contactPhone"]
                    self.stats["fields_filled"]["contactPhone"] = self.stats["fields_filled"].get("contactPhone", 0) + 1
                
                if "photoUrl" in missing and scraped.get("photoUrl"):
                    img_path = self.download_image(scraped["photoUrl"], venue.get("id", "unknown"), "venue")
                    if img_path:
                        updates["photoUrl"] = img_path
                        self.stats["fields_filled"]["photoUrl"] = self.stats["fields_filled"].get("photoUrl", 0) + 1
        
        # Buscar imagem genérica se ainda não tiver
        if "photoUrl" in missing and not updates.get("photoUrl"):
            query = f"{venue.get('name', '')} venue Portugal"
            img_url = self.search_image_unsplash(query) or self.search_image_pexels(query)
            if img_url:
                img_path = self.download_image(img_url, venue.get("id", "unknown"), "venue")
                if img_path:
                    updates["photoUrl"] = img_path
                    self.stats["fields_filled"]["photoUrl"] = self.stats["fields_filled"].get("photoUrl", 0) + 1
        
        # Preencher país padrão
        if "country" in missing:
            updates["country"] = "Portugal"
        
        # Preencher região baseado na cidade
        if "region" in missing and venue.get("city"):
            city = venue["city"].lower()
            if any(x in city for x in ["porto", "braga", "vila nova", "aveiro"]):
                updates["region"] = "Norte"
            elif any(x in city for x in ["coimbra", "leiria", "viseu"]):
                updates["region"] = "Centro"
            elif any(x in city for x in ["lisboa", "setúbal", "évora", "beja", "faro"]):
                updates["region"] = "Sul"
            elif any(x in city for x in ["funchal", "angra", "ponta delgada"]):
                updates["region"] = "Ilhas"
        
        if updates:
            print(f"   ✅ Preenchido: {', '.join(updates.keys())}")
            venue.update(updates)
            self.stats["updated"] += 1
        else:
            print(f"   ⚠️  Nenhuma informação encontrada")
        
        self.stats["processed"] += 1
        return venue
    
    def fill_producer_info(self, producer: Dict) -> Dict:
        """Preenche informações faltantes de um producer"""
        missing = self.get_missing_fields(producer, "producer")
        if not missing:
            return producer
        
        print(f"\n🎤 Processando: {producer.get('name', 'Sem nome')}")
        print(f"   Faltam {len(missing)} campo(s): {', '.join(missing)}")
        
        updates = {}
        
        # Scraping do website
        url = producer.get("url")
        if url and any(f in missing for f in ["contactEmail", "contactPhone", "photoUrl", "specialties"]):
            scraped = self.scrape_website(url)
            if scraped:
                if "contactEmail" in missing and scraped.get("contactEmail"):
                    updates["contactEmail"] = scraped["contactEmail"]
                    self.stats["fields_filled"]["contactEmail"] = self.stats["fields_filled"].get("contactEmail", 0) + 1
                
                if "contactPhone" in missing and scraped.get("contactPhone"):
                    updates["contactPhone"] = scraped["contactPhone"]
                    self.stats["fields_filled"]["contactPhone"] = self.stats["fields_filled"].get("contactPhone", 0) + 1
                
                if "photoUrl" in missing and scraped.get("photoUrl"):
                    img_path = self.download_image(scraped["photoUrl"], producer.get("id", "unknown"), "producer")
                    if img_path:
                        updates["photoUrl"] = img_path
                        self.stats["fields_filled"]["photoUrl"] = self.stats["fields_filled"].get("photoUrl", 0) + 1
        
        # Buscar imagem genérica
        if "photoUrl" in missing and not updates.get("photoUrl"):
            query = f"{producer.get('name', '')} music producer Portugal"
            img_url = self.search_image_unsplash(query) or self.search_image_pexels(query)
            if img_url:
                img_path = self.download_image(img_url, producer.get("id", "unknown"), "producer")
                if img_path:
                    updates["photoUrl"] = img_path
                    self.stats["fields_filled"]["photoUrl"] = self.stats["fields_filled"].get("photoUrl", 0) + 1
        
        # Preencher país padrão
        if "country" in missing:
            updates["country"] = "Portugal"
        
        # Preencher região baseado na cidade
        if "region" in missing and producer.get("city"):
            city = producer["city"].lower()
            if any(x in city for x in ["porto", "braga", "vila nova", "aveiro"]):
                updates["region"] = "Norte"
            elif any(x in city for x in ["coimbra", "leiria", "viseu"]):
                updates["region"] = "Centro"
            elif any(x in city for x in ["lisboa", "setúbal", "évora", "beja", "faro"]):
                updates["region"] = "Sul"
            elif any(x in city for x in ["funchal", "angra", "ponta delgada"]):
                updates["region"] = "Ilhas"
        
        if updates:
            print(f"   ✅ Preenchido: {', '.join(updates.keys())}")
            producer.update(updates)
            self.stats["updated"] += 1
        else:
            print(f"   ⚠️  Nenhuma informação encontrada")
        
        self.stats["processed"] += 1
        return producer
    
    def run(self, limit: Optional[int] = None):
        """Executa o processo de preenchimento"""
        print("🚀 Iniciando preenchimento de informações faltantes...\n")
        
        data = self.load_data()
        
        if self.entity_type in ["all", "venues"]:
            venues = data.get("venues", [])
            if limit:
                venues = venues[:limit]
            
            print(f"📊 Processando {len(venues)} venue(s)...")
            for venue in venues:
                try:
                    self.fill_venue_info(venue)
                    time.sleep(0.5)  # Rate limiting
                except Exception as e:
                    print(f"  ❌ Erro: {e}")
                    self.stats["errors"] += 1
        
        if self.entity_type in ["all", "producers"]:
            producers = data.get("producers", [])
            if limit:
                producers = producers[:limit]
            
            print(f"\n📊 Processando {len(producers)} producer(s)...")
            for producer in producers:
                try:
                    self.fill_producer_info(producer)
                    time.sleep(0.5)  # Rate limiting
                except Exception as e:
                    print(f"  ❌ Erro: {e}")
                    self.stats["errors"] += 1
        
        # Salvar dados atualizados
        self.save_data(data)
        
        # Estatísticas finais
        print("\n" + "="*60)
        print("📈 ESTATÍSTICAS FINAIS")
        print("="*60)
        print(f"Processados: {self.stats['processed']}")
        print(f"Atualizados: {self.stats['updated']}")
        print(f"Erros: {self.stats['errors']}")
        print(f"\nCampos preenchidos:")
        for field, count in self.stats["fields_filled"].items():
            print(f"  - {field}: {count}")
        print("\n✅ Dados atualizados salvos em:")
        print(f"   - {DATA_DIR / 'venues_updated.json'}")
        print(f"   - {DATA_DIR / 'producers_updated.json'}")


def export_data_from_browser():
    """Instruções para exportar dados do browser"""
    print("""
📋 INSTRUÇÕES PARA EXPORTAR DADOS DO BROWSER:

1. Abra o DevTools (F12) no browser
2. Vá para a aba Console
3. Execute o seguinte código:

// Para Venues
(async () => {
  const { getAllVenues } = await import('/src/lib/venuesDb.ts');
  const venues = await getAllVenues();
  const dataStr = JSON.stringify(venues, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'venues_export.json';
  a.click();
})();

// Para Producers
(async () => {
  const { getAllProducers } = await import('/src/lib/producersDb.ts');
  const producers = await getAllProducers();
  const dataStr = JSON.stringify(producers, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'producers_export.json';
  a.click();
})();

4. Salve os arquivos em: scripts/../data/
    """)


def main():
    parser = argparse.ArgumentParser(
        description="Preenche automaticamente informações faltantes em Venues e Producers"
    )
    parser.add_argument(
        "--type",
        choices=["venues", "producers", "all"],
        default="all",
        help="Tipo de entidade a processar"
    )
    parser.add_argument(
        "--limit",
        type=int,
        help="Limitar número de entidades a processar"
    )
    parser.add_argument(
        "--export-instructions",
        action="store_true",
        help="Mostrar instruções para exportar dados do browser"
    )
    
    args = parser.parse_args()
    
    if args.export_instructions:
        export_data_from_browser()
        return
    
    filler = MissingInfoFiller(args.type)
    filler.run(limit=args.limit)


if __name__ == "__main__":
    main()

