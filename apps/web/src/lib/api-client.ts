import { PublicProject, PublicEvent, FeatRequest, NFCTag } from "@/types/public";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = typeof window !== "undefined" 
      ? localStorage.getItem("auth_token") 
      : null;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro desconhecido" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async register(email: string, password: string, name?: string) {
    return this.request<{ success: boolean; message: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(token: string) {
    return this.request<{ success: boolean; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async getMe() {
    return this.request<{ user: any }>("/auth/me");
  }

  async logout() {
    return this.request<{ success: boolean; message: string }>("/auth/logout", {
      method: "POST",
    });
  }

  // Public Projects
  async getPublicProjects() {
    return this.request<{ projects: PublicProject[]; count: number }>("/public/projects");
  }

  async getPublicProject(id: string) {
    return this.request<{ project: PublicProject }>(`/public/projects/${id}`);
  }

  async getProjectProgress(id: string) {
    return this.request<{
      progress: number;
      currentStep: number;
      totalSteps: number;
      updatedAt: string;
    }>(`/public/projects/${id}/progress`);
  }

  async setProjectPublic(id: string, isPublic: boolean) {
    return this.request<{ success: boolean; project: { id: string; isPublic: boolean } }>(
      `/public/projects/${id}/public`,
      {
        method: "PUT",
        body: JSON.stringify({ isPublic }),
      }
    );
  }

  // Public Events
  async getPublicEvents() {
    return this.request<{ events: PublicEvent[]; count: number }>("/public/events");
  }

  async getPublicEvent(id: string) {
    return this.request<{ event: PublicEvent }>(`/public/events/${id}`);
  }

  async getEventProgress(id: string) {
    return this.request<{
      progress: number;
      currentStep: number;
      totalSteps: number;
      updatedAt: string;
    }>(`/public/events/${id}/progress`);
  }

  // Feat System
  async createFeatRequest(data: {
    serviceType: "featuring" | "production" | "audiovisual";
    details: string;
    amount: number;
    currency?: string;
  }) {
    return this.request<{ success: boolean; feat: FeatRequest & { paymentLink?: string } }>(
      "/feat/create",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async getFeatRequest(id: string) {
    return this.request<{ feat: FeatRequest }>(`/feat/${id}`);
  }

  async payFeatRequest(id: string, paymentMethod?: string) {
    return this.request<{
      success: boolean;
      paymentLink: string;
      paymentId: string;
      message: string;
    }>(`/feat/${id}/pay`, {
      method: "POST",
      body: JSON.stringify({ paymentMethod }),
    });
  }

  // NFC System
  async registerNFCTag(data: {
    tagId: string;
    title: string;
    artist: string;
    album?: string;
    redirectUrl: string;
    contentUrl?: string;
    metadata?: any;
  }) {
    return this.request<{ success: boolean; tag: NFCTag }>("/nfc/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getNFCTag(tagId: string) {
    return this.request<{ tag: Partial<NFCTag> }>(`/nfc/${tagId}`);
  }

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
      method: "POST",
    });
  }
}

export const apiClient = new ApiClient();



