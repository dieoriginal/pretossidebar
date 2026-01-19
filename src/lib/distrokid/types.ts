/**
 * Tipos TypeScript para o wrapper DistroKid API
 * Baseado no projeto DistroGo (Go) adaptado para TypeScript
 */

/**
 * Informações sobre um release (lançamento)
 */
export interface Release {
  id: string;
  title: string;
  artist: string;
  releaseDate: string;
  coverArt?: string;
  tracks?: Track[];
  [key: string]: any; // Para campos adicionais que possam existir
}

/**
 * Informações sobre uma track (faixa)
 */
export interface Track {
  id: string;
  title: string;
  artist: string;
  duration?: number; // em segundos
  isrc?: string;
  playCount?: number;
  releaseId?: string;
  [key: string]: any; // Para campos adicionais que possam existir
}

/**
 * Informações sobre um vídeo
 */
export interface Video {
  id: string;
  title: string;
  artist: string;
  views?: number;
  description?: string;
  thumbnail?: string;
  videoUrl?: string;
  duration?: number; // em segundos
  publishedAt?: string;
  [key: string]: any; // Para campos adicionais que possam existir
}

/**
 * Resposta de erro da API
 */
export interface DistroKidError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Opções de configuração do cliente DistroKid
 */
export interface DistroKidOptions {
  bearerToken?: string;
  baseUrl?: string;
  timeout?: number;
}



