/**
 * Sincronização de dados do IndexedDB para Supabase
 * Permite que projetos marcados como públicos sejam acessíveis via API
 */

import { supabase } from "./supabase";
import { getAllProjectsFromIndexedDB } from "./db";
import { getAllEventsFromIndexedDB } from "./events-db";
import { projectToPublic, eventToPublic } from "./public-helpers";

/**
 * Sincronizar um projeto específico para Supabase
 */
export async function syncProjectToPublic(projectId: string, projectData: any) {
  try {
    const isPublic = projectData.isPublic !== false;
    
    if (!isPublic) {
      // Se não for público, marcar como inativo no Supabase
      const { data: existing } = await supabase
        .from('public_projects')
        .select('id')
        .eq('id', projectId)
        .single();

      if (existing) {
        await supabase
          .from('public_projects')
          .update({
            is_public: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId);
      }
      return;
    }

    // Converter para formato público
    const publicProject = projectToPublic(projectData, true);

    // Salvar no Supabase
    const { error } = await supabase
      .from('public_projects')
      .upsert({
        id: projectId,
        data: publicProject,
        is_public: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (error) {
      throw error;
    }

    console.log(`Projeto ${projectId} sincronizado como público`);
  } catch (error) {
    console.error(`Erro ao sincronizar projeto ${projectId}:`, error);
    throw error;
  }
}

/**
 * Sincronizar um evento específico para Supabase
 */
export async function syncEventToPublic(eventId: string, eventData: any) {
  try {
    const isPublic = eventData.isPublic !== false;
    
    if (!isPublic) {
      const { data: existing } = await supabase
        .from('public_events')
        .select('id')
        .eq('id', eventId)
        .single();

      if (existing) {
        await supabase
          .from('public_events')
          .update({
            is_public: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', eventId);
      }
      return;
    }

    const publicEvent = eventToPublic(eventData, true);

    const { error } = await supabase
      .from('public_events')
      .upsert({
        id: eventId,
        data: publicEvent,
        is_public: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (error) {
      throw error;
    }

    console.log(`Evento ${eventId} sincronizado como público`);
  } catch (error) {
    console.error(`Erro ao sincronizar evento ${eventId}:`, error);
    throw error;
  }
}

/**
 * Sincronizar todos os projetos públicos
 */
export async function syncAllPublicProjects() {
  try {
    const projects = await getAllProjectsFromIndexedDB() as any[];
    
    for (const projectItem of projects) {
      const projectData = projectItem.data || projectItem;
      if (projectData.isPublic !== false) {
        await syncProjectToPublic(projectData.id, projectData);
      }
    }

    console.log("Todos os projetos públicos sincronizados");
  } catch (error) {
    console.error("Erro ao sincronizar projetos:", error);
    throw error;
  }
}

/**
 * Sincronizar todos os eventos públicos
 */
export async function syncAllPublicEvents() {
  try {
    const events = await getAllEventsFromIndexedDB() as any[];
    
    for (const eventItem of events) {
      const eventData = eventItem.data || eventItem;
      if (eventData.isPublic !== false) {
        await syncEventToPublic(eventData.id, eventData);
      }
    }

    console.log("Todos os eventos públicos sincronizados");
  } catch (error) {
    console.error("Erro ao sincronizar eventos:", error);
    throw error;
  }
}

/**
 * Função helper para ser chamada quando um projeto é marcado como público
 */
export async function onProjectPublicStatusChanged(projectId: string, projectData: any) {
  await syncProjectToPublic(projectId, projectData);
}

/**
 * Função helper para ser chamada quando um evento é marcado como público
 */
export async function onEventPublicStatusChanged(eventId: string, eventData: any) {
  await syncEventToPublic(eventId, eventData);
}



