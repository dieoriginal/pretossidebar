/**
 * Wrapper de compatibilidade - redireciona para Supabase
 * Mantém a mesma interface para não quebrar código existente
 */

import { saveProjectToIndexedDB, loadProjectFromIndexedDB } from './db';
import {
  syncProjectToCloud as supabaseSyncProjectToCloud,
  loadProjectsFromCloud as supabaseLoadProjectsFromCloud,
  publishPublicSingle as supabasePublishPublicSingle,
  fetchPublicSingles as supabaseFetchPublicSingles,
  saveProjectToSupabase,
} from './supabase';

// Helper para obter userId do Clerk ou fallback
export const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Tentar obter do Clerk
  try {
    // @ts-ignore - Clerk pode não estar disponível
    const clerk = window.Clerk;
    if (clerk?.user?.id) {
      return clerk.user.id;
    }
  } catch (e) {
    // Clerk não disponível
  }
  
  // Fallback para demo-user se não houver Clerk
  return 'demo-user';
};

// Re-exportar funções do Supabase mantendo compatibilidade
export const syncProjectToCloud = supabaseSyncProjectToCloud;
export const loadProjectsFromCloud = supabaseLoadProjectsFromCloud;
export const publishPublicSingle = supabasePublishPublicSingle;
export const fetchPublicSingles = supabaseFetchPublicSingles;

// Manter exports antigos do Firebase para compatibilidade (deprecated)
export const db = null;
export const auth = {
  currentUser: null,
} as any;
export const analytics = null as unknown as undefined;

export const saveProjectLocally = async (state: any) => {
  try {
    return await saveProjectToIndexedDB(state);
  } catch (error) {
    console.error('Erro ao salvar projeto localmente:', error);
    throw error;
  }
};

export const loadLocalProject = async (projectId: string) => {
  try {
    return await loadProjectFromIndexedDB(projectId);
  } catch (error) {
    console.error('Erro ao carregar projeto local:', error);
    return null;
  }
};

export const saveProjectToFirebase = async (projectId: string, projectData: any) => {
  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("Usuário não autenticado");
    if (!projectData || !projectData.songInfo) {
      throw new Error("Dados do projeto incompletos");
    }

    return await saveProjectToSupabase(projectId, projectData, userId);
  } catch (error) {
    console.error("Erro ao salvar projeto:", error);
    throw error;
  }
};

const validateProject = (project: any) => {
  if (!project) throw new Error('Projeto não definido');
  if (!project.id) throw new Error('ID do projeto não definido');
  if (!project.songInfo) throw new Error('Informações da música não definidas');
  if (!project.data) throw new Error('Dados do projeto não definidos');
};

export const autoSaveProject = async (projectId: string, projectData: any) => {
  try {
    validateProject(projectData);
    await saveProjectLocally(projectData);
    const userId = getCurrentUserId();
    if (userId) {
      await saveProjectToFirebase(projectId, projectData);
    }
  } catch (error) {
    console.error('Erro no salvamento automático:', error);
    throw error;
  }
};