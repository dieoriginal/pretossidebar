/**
 * API de Vídeos DistroKid
 * Esta API não requer token de autenticação
 */

import type { Video, DistroKidError } from './types';

const VIDEOS_API_BASE_URL = 'https://api.distrokid.com/videos';

/**
 * Obtém informações sobre vídeos específicos
 * @param videoIds Array de IDs de vídeos (ex: ["Rc92Mqy6SWr", "mv-K0ye9T6Xv"])
 * @returns Array de informações dos vídeos
 */
export async function getVideos(videoIds: string[]): Promise<Video[]> {
  if (!videoIds || videoIds.length === 0) {
    throw new Error('É necessário fornecer pelo menos um ID de vídeo');
  }

  try {
    // Faz requisições para cada vídeo (a API pode não suportar batch)
    const videoPromises = videoIds.map(async (videoId) => {
      try {
        const response = await fetch(`${VIDEOS_API_BASE_URL}/${videoId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // Se o vídeo for privado ou não existir, pode retornar erro
          if (response.status === 404 || response.status === 403) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.message || 
              `Vídeo ${videoId} não encontrado ou é privado`
            );
          }
          
          const errorData = await response.json().catch(() => ({}));
          const error: DistroKidError = {
            message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            code: errorData.code,
            status: response.status,
          };
          throw error;
        }

        return await response.json();
      } catch (error: any) {
        // Se for erro de vídeo privado, relança
        if (error.message?.includes('privado') || error.status === 403) {
          throw error;
        }
        // Para outros erros, retorna null para ser filtrado
        console.warn(`Erro ao obter vídeo ${videoId}:`, error.message);
        return null;
      }
    });

    const results = await Promise.all(videoPromises);
    
    // Filtra resultados nulos e retorna apenas vídeos válidos
    return results.filter((video): video is Video => video !== null);
  } catch (error: any) {
    throw new Error(`Erro ao obter vídeos: ${error.message}`);
  }
}

/**
 * Obtém informações sobre um único vídeo
 * @param videoId ID do vídeo
 * @returns Informações do vídeo
 */
export async function getVideo(videoId: string): Promise<Video> {
  const videos = await getVideos([videoId]);
  
  if (videos.length === 0) {
    throw new Error(`Vídeo ${videoId} não encontrado ou é privado`);
  }
  
  return videos[0];
}



