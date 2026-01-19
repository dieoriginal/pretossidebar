import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

interface DGARTESEntity {
  name: string;
  area: string;
  region: string;
  url?: string;
}

// Mapear regiões da DGARTES para o formato do sistema
const mapRegion = (dgartesRegion: string): string => {
  const regionMap: Record<string, string> = {
    'Norte': 'Norte',
    'Centro': 'Centro',
    'Lisboa e vale do Tejo': 'Lisboa e vale do Tejo',
    'Alentejo': 'Sul',
    'Algarve': 'Sul',
    'Açores': 'Ilhas',
    'Madeira': 'Ilhas',
    'Online': 'outro',
  };
  return regionMap[dgartesRegion] || 'outro';
};

async function scrapePage(page: number): Promise<{ entities: DGARTESEntity[]; hasNext: boolean; totalPages?: number }> {
  try {
    const url = `https://www.dgartes.gov.pt/pt/vnode/4?page=${page}`;
    console.log(`Scraping page ${page}...`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
      },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);
    const entities: DGARTESEntity[] = [];

    // Baseado na estrutura real do site DGARTES, as entidades estão listadas
    // Vamos procurar por padrões específicos baseados no HTML fornecido
    // O site mostra entidades em uma lista com nome, área e região

    // Estratégia 1: Procurar por elementos que contenham nome + área + região
    // No HTML fornecido, parece que cada entidade tem seu nome como texto principal
    // e área/região como texto secundário
    
    // Procurar por todas as possíveis estruturas de lista
    const listContainers = $('main, .content, .main-content, #main, [role="main"]');
    
    // Se não encontrar containers específicos, usar body
    const searchRoot = listContainers.length > 0 ? listContainers.first() : $('body');
    
    // Procurar por blocos que possam conter entidades
    // Baseado no exemplo: cada entidade parece estar em um bloco com nome + área + região
    searchRoot.find('div, li, article, section').each((index, element) => {
      const $el = $(element);
      const text = $el.text().trim();
      
      // Ignorar elementos muito pequenos ou muito grandes (provavelmente não são entidades)
      if (text.length < 3 || text.length > 500) return;
      
      // Ignorar elementos que são claramente navegação
      if (text.includes('Sobre nós') || 
          text.includes('Contactos') ||
          text.includes('Pesquisa') ||
          text.includes('primeira') ||
          text.includes('anterior') ||
          text.includes('última') ||
          text.includes('seguinte') ||
          $el.closest('nav, header, footer').length > 0) {
        return;
      }

      // Procurar por padrão de nome de entidade (primeira linha geralmente é o nome)
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 1) return;

      const name = lines[0];
      
      // Filtrar nomes muito curtos ou que parecem ser labels
      if (name.length < 3 || 
          name.toLowerCase().includes('navegação') ||
          name.toLowerCase().includes('menu') ||
          name.match(/^\d+$/) || // Apenas números
          name.includes('«') || name.includes('»')) {
        return;
      }

      // Procurar área artística no texto
      let area = '';
      const areaPatterns = [
        /Artes performativas/i,
        /Artes visuais/i,
        /Arquitetura/i,
        /Artes de rua/i,
        /Artes digitais/i,
        /Artes plásticas/i,
        /Circo/i,
        /Dança/i,
        /Design/i,
        /Fotografia/i,
        /Música/i,
        /Ópera/i,
        /Teatro/i,
        /Cruzamento disciplinar/i,
      ];
      
      for (const pattern of areaPatterns) {
        const match = text.match(pattern);
        if (match) {
          area = match[0];
          break;
        }
      }

      // Procurar região no texto
      let region = '';
      const regionPatterns = [
        /Norte/i,
        /Centro/i,
        /Lisboa e vale do Tejo/i,
        /Alentejo/i,
        /Algarve/i,
        /Açores/i,
        /Madeira/i,
        /Online/i,
      ];
      
      for (const pattern of regionPatterns) {
        const match = text.match(pattern);
        if (match) {
          region = match[0];
          break;
        }
      }

      // Procurar link
      const link = $el.find('a').first().attr('href');
      const url = link ? (link.startsWith('http') ? link : `https://www.dgartes.gov.pt${link}`) : undefined;

      // Verificar se já não adicionamos esta entidade
      const isDuplicate = entities.some(e => 
        e.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
      
      if (!isDuplicate && name.length >= 3) {
        entities.push({
          name: name.trim(),
          area: area || 'Não especificada',
          region: region || 'Não especificada',
          url,
        });
      }
    });

    // Estratégia 2: Se não encontrou muitas entidades, procurar por links que parecem ser entidades
    if (entities.length < 5) {
      const areaPatterns = [
        /Artes performativas/i,
        /Artes visuais/i,
        /Arquitetura/i,
        /Artes de rua/i,
        /Artes digitais/i,
        /Artes plásticas/i,
        /Circo/i,
        /Dança/i,
        /Design/i,
        /Fotografia/i,
        /Música/i,
        /Ópera/i,
        /Teatro/i,
        /Cruzamento disciplinar/i,
      ];
      
      const regionPatterns = [
        /Norte/i,
        /Centro/i,
        /Lisboa e vale do Tejo/i,
        /Alentejo/i,
        /Algarve/i,
        /Açores/i,
        /Madeira/i,
        /Online/i,
      ];
      
      searchRoot.find('a').each((index, element) => {
        const $link = $(element);
        const text = $link.text().trim();
        const href = $link.attr('href');
        const parentText = $link.parent().text().trim();
        
        // Filtrar links válidos
        if (text && text.length >= 3 && text.length <= 200 &&
            href && 
            !href.includes('javascript:') &&
            !href.startsWith('#') &&
            !text.toLowerCase().includes('sobre') &&
            !text.toLowerCase().includes('contacto') &&
            !text.toLowerCase().includes('pesquisa') &&
            !text.toLowerCase().includes('primeira') &&
            !text.toLowerCase().includes('anterior') &&
            !text.toLowerCase().includes('seguinte') &&
            !text.toLowerCase().includes('última') &&
            !text.match(/^\d+$/)) {
          
          // Verificar se o texto do link parece ser um nome de entidade
          // Nomes de entidades geralmente têm primeira letra maiúscula e não são muito genéricos
          if (text[0] === text[0].toUpperCase()) {
            const isDuplicate = entities.some(e => 
              e.name.toLowerCase().trim() === text.toLowerCase().trim()
            );
            
            if (!isDuplicate) {
              // Tentar extrair área e região do texto do parent
              let area = '';
              let region = '';
              
              for (const pattern of areaPatterns) {
                const match = parentText.match(pattern);
                if (match) {
                  area = match[0];
                  break;
                }
              }
              
              for (const pattern of regionPatterns) {
                const match = parentText.match(pattern);
                if (match) {
                  region = match[0];
                  break;
                }
              }

              entities.push({
                name: text.trim(),
                area: area || 'Não especificada',
                region: region || 'Não especificada',
                url: href.startsWith('http') ? href : `https://www.dgartes.gov.pt${href}`,
              });
            }
          }
        }
      });
    }

    // Determinar se há próxima página
    let hasNext = false;
    let maxPage = page;

    // Procurar links de paginação
    const paginationText = $('body').text();
    const nextLink = $('a').filter((i, el) => {
      const text = $(el).text().toLowerCase();
      const href = $(el).attr('href');
      return text.includes('seguinte') || 
             text.includes('next') || 
             (href && href.includes(`page=${page + 1}`));
    });

    if (nextLink.length > 0) {
      hasNext = true;
    }

    // Tentar encontrar número de página máximo nos links de paginação
    $('a[href*="page="]').each((i, el) => {
      const href = $(el).attr('href');
      const pageMatch = href?.match(/page=(\d+)/);
      if (pageMatch) {
        const pageNum = parseInt(pageMatch[1], 10);
        if (pageNum > maxPage) maxPage = pageNum;
      }
    });

    // Se encontrou entidades mas não encontrou link de próxima página, tentar mais uma página
    if (!hasNext && entities.length > 0 && page === 1) {
      hasNext = true;
    }

    // Limpar duplicatas finais
    const uniqueEntities = entities.filter((entity, index, self) =>
      index === self.findIndex((e) => e.name.toLowerCase().trim() === entity.name.toLowerCase().trim())
    );

    return { 
      entities: uniqueEntities, 
      hasNext, 
      totalPages: maxPage > page ? maxPage : undefined 
    };
  } catch (error: any) {
    console.error(`Error scraping page ${page}:`, error.message);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const maxPages = parseInt(searchParams.get('maxPages') || '1', 10); // Default 1 página por requisição
    const page = parseInt(searchParams.get('page') || '1', 10);

    // Fazer scraping de uma página por vez (o cliente controla o loop)
    const result = await scrapePage(page);

    // Limpar duplicatas
    const uniqueEntities = result.entities.filter((entity, index, self) =>
      index === self.findIndex((e) => e.name.toLowerCase().trim() === entity.name.toLowerCase().trim())
    );

    return NextResponse.json({
      success: true,
      entities: uniqueEntities,
      total: uniqueEntities.length,
      page: page,
      hasNext: result.hasNext,
      totalPages: result.totalPages,
    });
  } catch (error: any) {
    console.error('Error in DGARTES scrape route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro ao fazer scraping das entidades da DGARTES' 
      },
      { status: 500 }
    );
  }
}
