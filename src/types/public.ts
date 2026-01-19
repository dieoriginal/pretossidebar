import { ProjectState } from "@/hooks/use-project";
import { EventData } from "@/hooks/use-events";

/**
 * Versão sanitizada de ProjectState para exibição pública
 * Remove dados sensíveis e mantém apenas informações relevantes para fãs
 */
export interface PublicProject {
  id: string;
  type: "single" | "merch" | "event";
  title: string;
  artist: string;
  producer?: string;
  featuring?: string[];
  synopsis?: string;
  currentStep: number;
  totalSteps: number;
  progress: number; // 0-100
  isPublic: boolean;
  coverUrl?: string;
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Versão sanitizada de EventData para exibição pública
 */
export interface PublicEvent {
  id: string;
  eventName: string;
  eventType: string;
  date: string;
  venue: string;
  city?: string;
  capacity: number;
  description: string;
  currentStep: number;
  totalSteps: number;
  progress: number; // 0-100
  isPublic: boolean;
  ticketPrice?: number;
  soldTickets?: number;
  totalTickets?: number;
  ticketUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pedido de featuring/produção/serviço audiovisual
 */
export interface FeatRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  serviceType: "featuring" | "production" | "audiovisual";
  details: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "processing" | "completed" | "cancelled";
  paymentId?: string;
  paymentLink?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tag NFC para sistema "Bring Back CD"
 */
export interface NFCTag {
  id: string;
  tagId: string; // ID único da tag física
  title: string;
  artist: string;
  album?: string;
  redirectUrl: string; // URL para redirecionamento
  contentUrl?: string; // URL do conteúdo digital (música, vídeo)
  metadata?: {
    coverUrl?: string;
    releaseDate?: string;
    genre?: string;
    description?: string;
  };
  isActive: boolean;
  scanCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Log de scan de tag NFC
 */
export interface NFCScan {
  id: string;
  tagId: string;
  userId?: string; // Opcional - se usuário estiver logado
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    city?: string;
  };
  scannedAt: string;
}



