import { NextRequest, NextResponse } from 'next/server';

interface DGARTESEntity {
  name: string;
  area: string;
  region: string;
  url?: string;
}

interface ImportRequest {
  entities: DGARTESEntity[];
}

// Esta rota será chamada do cliente para importar as entidades como venues
// O cliente fará o scraping e depois chamará esta API para adicionar ao IndexedDB
export async function POST(request: NextRequest) {
  try {
    const body: ImportRequest = await request.json();
    const { entities } = body;

    if (!entities || !Array.isArray(entities)) {
      return NextResponse.json(
        { success: false, error: 'Entidades inválidas' },
        { status: 400 }
      );
    }

    // Retornar as entidades formatadas para o cliente adicionar ao IndexedDB
    // O cliente usará addVenue do venuesDb.ts
    const formattedVenues = entities.map((entity) => {
      // Mapear região da DGARTES para o formato do sistema
      const regionMap: Record<string, string> = {
        'Norte': 'Norte',
        'Centro': 'Centro',
        'Lisboa e vale do Tejo': 'Lisboa e vale do Tejo',
        'Alentejo': 'Sul',
        'Algarve': 'Sul',
        'Açores': 'Ilhas',
        'Madeira': 'Ilhas',
        'Online': 'outro',
        'Não especificada': 'outro',
      };

      const mappedRegion = regionMap[entity.region] || 'outro';

      // Extrair cidade do nome se possível (algumas entidades podem ter cidade no nome)
      let city = '';
      const cityMatch = entity.name.match(/(?:Lagos|Porto|Lisboa|Braga|Coimbra|Aveiro|Faro|Setúbal|Évora|Leiria|Funchal|Ponta Delgada)/i);
      if (cityMatch) {
        city = cityMatch[0];
      }

      return {
        name: entity.name.trim(),
        region: mappedRegion,
        city: city || undefined,
        country: 'Portugal',
        url: entity.url,
        notes: `Área artística: ${entity.area} | Fonte: DGARTES`,
        entityType: 'venue' as const,
      };
    });

    return NextResponse.json({
      success: true,
      venues: formattedVenues,
      total: formattedVenues.length,
    });
  } catch (error: any) {
    console.error('Error in DGARTES import route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro ao processar importação' 
      },
      { status: 500 }
    );
  }
}









