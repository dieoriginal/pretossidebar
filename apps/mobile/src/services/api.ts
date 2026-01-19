/**
 * API Client para React Native
 * Adaptado do api-client.ts do website
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// URL da API - use a URL do seu projeto Vercel ou localhost para desenvolvimento
const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || 
  process.env.API_BASE_URL || 
  'http://localhost:3000/api'; // Para desenvolvimento local

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await AsyncStorage.getItem('auth_token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async register(email: string, password: string, name?: string) {
    return this.request<{ success: boolean; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(token: string) {
    return this.request<{ success: boolean; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  // Public Projects
  async getPublicProjects() {
    return this.request<{ projects: any[]; count: number }>('/public/projects');
  }

  async getPublicProject(id: string) {
    return this.request<{ project: any }>(`/public/projects/${id}`);
  }

  async getProjectProgress(id: string) {
    return this.request<{
      progress: number;
      currentStep: number;
      totalSteps: number;
      updatedAt: string;
    }>(`/public/projects/${id}/progress`);
  }

  // Public Events
  async getPublicEvents() {
    return this.request<{ events: any[]; count: number }>('/public/events');
  }

  async getPublicEvent(id: string) {
    return this.request<{ event: any }>(`/public/events/${id}`);
  }

  // Feat
  async createFeatRequest(data: {
    serviceType: 'featuring' | 'production' | 'audiovisual';
    details: string;
    amount: number;
    currency?: string;
  }) {
    return this.request<{ success: boolean; feat: any }>('/feat/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // NFC
  async scanNFCTag(tagId: string) {
    return this.request<{
      success: boolean;
      tag: {
        id: string;
        title: string;
        artist: string;
        redirectUrl: string;
        contentUrl?: string;
      };
    }>(`/nfc/${tagId}/scan`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();



