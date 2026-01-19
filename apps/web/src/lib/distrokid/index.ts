/**
 * DistroKid API Wrapper
 * Wrapper não oficial para a API do DistroKid
 * Baseado na reversão da aplicação iOS do DistroKid
 * 
 * @example
 * ```typescript
 * import { createDistroKidClient, getVideos } from '@/lib/distrokid';
 * 
 * // Para releases e tracks (requer token)
 * const client = createDistroKidClient('seu-bearer-token');
 * const releases = await client.getReleases();
 * 
 * // Para vídeos (não requer token)
 * const videos = await getVideos(['Rc92Mqy6SWr', 'mv-K0ye9T6Xv']);
 * ```
 */

export { DistroKidClient, createDistroKidClient } from './client';
export { getVideos, getVideo } from './videos';
export type {
  Release,
  Track,
  Video,
  DistroKidError,
  DistroKidOptions,
} from './types';



