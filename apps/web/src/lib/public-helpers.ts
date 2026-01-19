import { ProjectState } from "@/hooks/use-project";
import { EventData } from "@/hooks/use-events";
import { PublicProject, PublicEvent } from "@/types/public";
import { getAllProjectsFromIndexedDB } from "./db";
import { getAllEventsFromIndexedDB } from "./events-db";
import { fetchPublicProjects, fetchPublicEvents, fetchPublicProject, fetchPublicEvent } from "./supabase";

/**
 * Converte ProjectState para PublicProject
 */
export function projectToPublic(project: ProjectState, isPublic: boolean = false): PublicProject {
  const currentStep = typeof project.currentStep === 'number' ? project.currentStep : 0;
  const totalSteps = project.totalSteps || 10;
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  return {
    id: project.id,
    type: project.type,
    title: project.songInfo?.title || "Sem título",
    artist: project.songInfo?.artist || "",
    producer: project.songInfo?.producer,
    featuring: project.songInfo?.featuring || [],
    synopsis: project.songInfo?.synopsis,
    currentStep,
    totalSteps,
    progress,
    isPublic,
    updatedAt: project.updatedAt || new Date().toISOString(),
    createdAt: project.updatedAt || new Date().toISOString(), // Fallback
  };
}

/**
 * Converte EventData para PublicEvent
 */
export function eventToPublic(event: EventData, isPublic: boolean = false): PublicEvent {
  // Calcular progresso baseado nos steps completados
  // Assumindo 10 steps padrão para eventos
  const totalSteps = 10;
  const currentStep = 0; // TODO: Adicionar tracking de steps em EventData
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  // Extrair cidade do venue ou do overview
  const venueName = event.overview?.venue || event.venues?.primary?.name || "";
  const city = event.overview?.city || event.venues?.primary?.city || "";

  return {
    id: event.id || `event-${Date.now()}`,
    eventName: event.overview?.eventName || "Evento sem nome",
    eventType: event.overview?.eventType || "",
    date: event.overview?.date || "",
    venue: venueName,
    city: city,
    capacity: event.overview?.capacity || event.venues?.requiredCapacity || 0,
    description: event.overview?.description || event.overview?.agenda || "",
    currentStep,
    totalSteps,
    progress,
    isPublic,
    ticketPrice: event.finance?.ticketPrice,
    soldTickets: event.tickets?.soldTickets,
    totalTickets: event.tickets?.totalTickets,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(), // Fallback
  };
}

/**
 * Carrega projetos públicos do Supabase e converte para PublicProject
 */
export async function getPublicProjects(): Promise<PublicProject[]> {
  try {
    // Tentar buscar do Supabase primeiro
    const supabaseProjects = await fetchPublicProjects();
    
    if (supabaseProjects.length > 0) {
      return supabaseProjects
        .map((p: any) => {
          const projectData = p.data;
          if (!projectData) return null;
          return projectToPublic(projectData, true);
        })
        .filter((p: any) => p !== null) as PublicProject[];
    }
    
    // Fallback para IndexedDB se Supabase não tiver dados
    const projects = await getAllProjectsFromIndexedDB() as any[];
    
    return projects
      .filter((p: any) => {
        const data = p.data || p;
        return data.isPublic !== false;
      })
      .map((p: any) => {
        const data = p.data || p;
        return projectToPublic(data, true);
      });
  } catch (error) {
    console.error("Erro ao carregar projetos públicos:", error);
    // Fallback para IndexedDB em caso de erro
    try {
      const projects = await getAllProjectsFromIndexedDB() as any[];
      return projects
        .filter((p: any) => {
          const data = p.data || p;
          return data.isPublic !== false;
        })
        .map((p: any) => {
          const data = p.data || p;
          return projectToPublic(data, true);
        });
    } catch (fallbackError) {
      console.error("Erro no fallback para IndexedDB:", fallbackError);
      return [];
    }
  }
}

/**
 * Carrega eventos públicos do Supabase e converte para PublicEvent
 */
export async function getPublicEvents(): Promise<PublicEvent[]> {
  try {
    // Tentar buscar do Supabase primeiro
    const supabaseEvents = await fetchPublicEvents();
    
    if (supabaseEvents.length > 0) {
      return supabaseEvents
        .map((e: any) => {
          const eventData = e.data;
          if (!eventData) return null;
          return eventToPublic(eventData, true);
        })
        .filter((e: any) => e !== null) as PublicEvent[];
    }
    
    // Fallback para IndexedDB se Supabase não tiver dados
    const events = await getAllEventsFromIndexedDB() as any[];
    
    return events
      .filter((e: any) => {
        const data = e.data || e;
        return data.isPublic !== false;
      })
      .map((e: any) => {
        const data = e.data || e;
        return eventToPublic(data, true);
      });
  } catch (error) {
    console.error("Erro ao carregar eventos públicos:", error);
    // Fallback para IndexedDB em caso de erro
    try {
      const events = await getAllEventsFromIndexedDB() as any[];
      return events
        .filter((e: any) => {
          const data = e.data || e;
          return data.isPublic !== false;
        })
        .map((e: any) => {
          const data = e.data || e;
          return eventToPublic(data, true);
        });
    } catch (fallbackError) {
      console.error("Erro no fallback para IndexedDB:", fallbackError);
      return [];
    }
  }
}

/**
 * Busca um projeto público específico do Supabase
 */
export async function getPublicProject(id: string): Promise<PublicProject | null> {
  try {
    const project = await fetchPublicProject(id);
    if (!project || !project.data) return null;
    return projectToPublic(project.data, true);
  } catch (error) {
    console.error("Erro ao carregar projeto público:", error);
    return null;
  }
}

/**
 * Busca um evento público específico do Supabase
 */
export async function getPublicEvent(id: string): Promise<PublicEvent | null> {
  try {
    const event = await fetchPublicEvent(id);
    if (!event || !event.data) return null;
    return eventToPublic(event.data, true);
  } catch (error) {
    console.error("Erro ao carregar evento público:", error);
    return null;
  }
}



