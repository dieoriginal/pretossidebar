/**
 * Cliente DistroKid API
 * Wrapper não oficial baseado na reversão da aplicação iOS do DistroKid
 */

import type { Release, Track, DistroKidError, DistroKidOptions } from './types';

const DEFAULT_BASE_URL = 'https://api.distrokid.com';

export class DistroKidClient {
  private bearerToken?: string;
  private baseUrl: string;
  private timeout: number;

  constructor(options: DistroKidOptions = {}) {
    this.bearerToken = options.bearerToken;
    this.baseUrl = options.baseUrl || DEFAULT_BASE_URL;
    this.timeout = options.timeout || 30000;
  }

  /**
   * Define o token de autenticação
   */
  setBearerToken(token: string): void {
    this.bearerToken = token;
  }

  /**
   * Faz uma requisição HTTP autenticada
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.bearerToken) {
      throw new Error('Bearer token é necessário para esta operação');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
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
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      if (error.status) {
        throw error;
      }
      
      throw new Error(`Erro na requisição: ${error.message}`);
    }
  }

  /**
   * Obtém todos os releases do artista
   */
  async getReleases(): Promise<Release[]> {
    try {
      const data = await this.request<{ releases?: Release[]; data?: Release[] }>('/releases');
      return data.releases || data.data || [];
    } catch (error: any) {
      throw new Error(`Erro ao obter releases: ${error.message}`);
    }
  }

  /**
   * Obtém um release específico por ID
   */
  async getRelease(releaseId: string): Promise<Release> {
    try {
      return await this.request<Release>(`/releases/${releaseId}`);
    } catch (error: any) {
      throw new Error(`Erro ao obter release: ${error.message}`);
    }
  }

  /**
   * Obtém todas as tracks do artista
   */
  async getTracks(): Promise<Track[]> {
    try {
      const data = await this.request<{ tracks?: Track[]; data?: Track[] }>('/tracks');
      return data.tracks || data.data || [];
    } catch (error: any) {
      throw new Error(`Erro ao obter tracks: ${error.message}`);
    }
  }

  /**
   * Obtém uma track específica por ID
   */
  async getTrack(trackId: string): Promise<Track> {
    try {
      return await this.request<Track>(`/tracks/${trackId}`);
    } catch (error: any) {
      throw new Error(`Erro ao obter track: ${error.message}`);
    }
  }
}

/**
 * Cria uma nova instância do cliente DistroKid
 */
export function createDistroKidClient(bearerToken?: string): DistroKidClient {
  return new DistroKidClient({ bearerToken });
}



