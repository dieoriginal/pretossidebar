# Script de Preenchimento Automático de Informações

Este script Python preenche automaticamente informações faltantes em **Venues** e **Producers**, incluindo busca de imagens.

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
pip install -r scripts/requirements-fill-missing.txt
```

### 2. Configurar APIs (Opcional mas Recomendado)

Crie um arquivo `.env` na raiz do projeto ou configure variáveis de ambiente:

```bash
export GOOGLE_PLACES_API_KEY="sua-chave-aqui"
export UNSPLASH_ACCESS_KEY="sua-chave-aqui"
export PEXELS_API_KEY="sua-chave-aqui"
```

**Onde obter as chaves:**
- **Google Places API**: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
- **Unsplash**: https://unsplash.com/developers
- **Pexels**: https://www.pexels.com/api/

### 3. Exportar Dados do Browser

Antes de executar o script, você precisa exportar os dados do IndexedDB:

1. Abra o DevTools (F12) no browser
2. Vá para a aba Console
3. Execute:

```javascript
// Carregar script de exportação
const script = document.createElement('script');
script.src = '/scripts/export-browser-data.js';
document.head.appendChild(script);

// Aguardar carregamento e executar
await exportAll();
```

4. Salve os arquivos `venues_export.json` e `producers_export.json` em `data/`

### 4. Executar o Script

```bash
# Processar todos (venues + producers)
python scripts/fill-missing-info.py --type all

# Apenas venues
python scripts/fill-missing-info.py --type venues

# Apenas producers
python scripts/fill-missing-info.py --type producers

# Limitar número de entidades (útil para testes)
python scripts/fill-missing-info.py --type all --limit 10

# Ver instruções de exportação
python scripts/fill-missing-info.py --export-instructions
```

### 5. Importar Dados Atualizados

Após executar o script, os dados atualizados estarão em:
- `data/venues_updated.json`
- `data/producers_updated.json`

Para importar de volta ao sistema:

1. Abra o DevTools (F12) no browser
2. Execute:

```javascript
// Carregar script de importação
const script = document.createElement('script');
script.src = '/scripts/import-updated-data.js';
document.head.appendChild(script);

// Aguardar e executar
await importAll();
```

## 📋 O que o Script Faz

### Para Venues:
- ✅ Busca telefone, email, website no Google Places API
- ✅ Geocodifica endereços (obtém lat/lng)
- ✅ Faz scraping de websites para extrair contatos
- ✅ Baixa imagens de websites ou busca em bancos de imagens
- ✅ Preenche região baseado na cidade
- ✅ Define país padrão como "Portugal"

### Para Producers:
- ✅ Faz scraping de websites para extrair contatos
- ✅ Busca imagens em bancos de imagens
- ✅ Preenche região baseado na cidade
- ✅ Define país padrão como "Portugal"

## 📊 Campos Preenchidos

### Prioridade Alta:
- `contactPhone` - Telefone de contacto
- `contactEmail` - Email de contacto
- `contactName` - Nome do contacto

### Prioridade Média:
- `city` - Cidade
- `url` - Website
- `capacity` - Lotação (apenas venues)
- `cae` - Código de Atividade Económica (apenas venues)
- `lat` / `lng` - Coordenadas GPS
- `producerType` - Tipo de produtor (apenas producers)
- `specialties` - Especialidades (apenas producers)

### Prioridade Baixa:
- `country` - País
- `region` - Região (Norte/Centro/Sul/Ilhas)
- `photoUrl` - URL da foto

## 🖼️ Imagens

O script:
1. Tenta extrair imagens do website (scraping)
2. Se não encontrar, busca em Unsplash
3. Se não encontrar, busca em Pexels
4. Baixa e salva em `public/images/`
5. Atualiza o campo `photoUrl` com o caminho relativo

## ⚙️ Configurações

### Rate Limiting
O script inclui delays automáticos para respeitar limites de APIs:
- Google Places: 200ms entre requisições
- Nominatim: 1s entre requisições
- Unsplash/Pexels: 100ms entre requisições

### Timeouts
- Requisições HTTP: 10-15 segundos
- Stream de imagens: 15 segundos

## 📁 Estrutura de Arquivos

```
scripts/
├── fill-missing-info.py          # Script principal
├── export-browser-data.js        # Script para exportar do browser
├── import-updated-data.js        # Script para importar de volta
├── requirements-fill-missing.txt # Dependências Python
└── README-fill-missing.md        # Este arquivo

data/
├── venues_export.json            # Dados exportados (você cria)
├── producers_export.json          # Dados exportados (você cria)
├── venues_updated.json            # Dados atualizados (gerado pelo script)
└── producers_updated.json         # Dados atualizados (gerado pelo script)

public/
└── images/
    ├── venue_xxx.jpg              # Imagens baixadas
    └── producer_xxx.jpg         # Imagens baixadas
```

## 🔍 Troubleshooting

### Erro: "No module named 'requests'"
```bash
pip install -r scripts/requirements-fill-missing.txt
```

### Erro: "FileNotFoundError: data/venues_export.json"
- Certifique-se de exportar os dados do browser primeiro
- Verifique se os arquivos estão em `data/`

### APIs retornando erro 403
- Verifique se as chaves de API estão corretas
- Algumas APIs têm limites de quota gratuita

### Imagens não estão sendo baixadas
- Verifique permissões de escrita em `public/images/`
- Alguns websites bloqueiam scraping de imagens

## 🎯 Exemplo Completo

```bash
# 1. Exportar dados
# (no browser console)
await exportAll();

# 2. Executar script
python scripts/fill-missing-info.py --type all --limit 5

# 3. Verificar resultados
cat data/venues_updated.json | jq '.[0]'

# 4. Importar de volta
# (no browser console)
await importAll();
```

## 📝 Notas

- O script **não sobrescreve** dados existentes, apenas preenche campos vazios
- Imagens são baixadas e salvas localmente
- O script respeita rate limits das APIs
- Logs detalhados são exibidos durante a execução
- Estatísticas finais mostram quantos campos foram preenchidos

## 🔐 Segurança

- **NUNCA** commite arquivos `.env` ou chaves de API no Git
- Use variáveis de ambiente ou arquivos `.env` locais
- Revogue chaves de API se expostas acidentalmente







