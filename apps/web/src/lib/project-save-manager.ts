/**
 * Gerenciador de salvamento de projetos
 * Gerencia listagem, salvamento, carregamento e exclusão de projetos
 */

import {
  saveProjectToIndexedDB,
  loadProjectFromIndexedDB,
  getAllProjectsFromIndexedDB,
  deleteProjectFromIndexedDB,
} from './db';
import { syncProjectToCloud } from './supabase';
import { getCurrentUserId } from './firebase';
import type { ProjectState } from '@/hooks/use-project';

export interface SavedProject {
  id: string;
  title?: string;
  artist?: string;
  producer?: string;
  updatedAt: string;
  createdAt?: string;
  type?: 'single' | 'merch' | 'event';
  hasCloudSync?: boolean;
  progress?: number; // Progresso do projeto (0-100)
}

/**
 * Salva projeto completo (local + cloud)
 */
export async function saveProject(
  project: ProjectState,
  userId?: string
): Promise<string> {
  try {
    // 1. Salvar local primeiro
    await saveProjectToIndexedDB(project);

    // 2. Sincronizar com nuvem se usuário autenticado
    const currentUserId = userId || getCurrentUserId();
    if (currentUserId) {
      try {
        await syncProjectToCloud(currentUserId, project);
      } catch (error) {
        console.warn('Erro ao sincronizar com nuvem (continuando...):', error);
        // Não falhar se cloud sync falhar - local já foi salvo
      }
    }

    return project.id;
  } catch (error) {
    console.error('Erro ao salvar projeto:', error);
    throw error;
  }
}

/**
 * Carrega projeto (local → cloud fallback)
 */
export async function loadProject(
  projectId: string,
  userId?: string
): Promise<ProjectState | null> {
  try {
    // 1. Tentar carregar local primeiro
    const localProject = await loadProjectFromIndexedDB(projectId);
    if (localProject) {
      return localProject as ProjectState;
    }

    // 2. Tentar carregar da nuvem se usuário autenticado
    const currentUserId = userId || getCurrentUserId();
    if (currentUserId) {
      try {
        const { loadProjectsFromCloud } = await import('./supabase');
        const cloudProjects = await loadProjectsFromCloud(currentUserId);
        const cloudProject = cloudProjects.find((p: any) => p.id === projectId);
        
        if (cloudProject) {
          // Salvar localmente para acesso offline
          await saveProjectToIndexedDB(cloudProject);
          return cloudProject as ProjectState;
        }
      } catch (error) {
        console.warn('Erro ao carregar da nuvem:', error);
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao carregar projeto:', error);
    return null;
  }
}

/**
 * Lista todos os projetos do usuário
 */
export async function listProjects(
  userId?: string
): Promise<SavedProject[]> {
  try {
    // 1. Carregar projetos locais
    const localProjects = (await getAllProjectsFromIndexedDB()) as any[];
    
    // 2. Mapear para formato SavedProject
    const savedProjects: SavedProject[] = localProjects.map((proj) => {
      const projectData = proj.data || proj;
      return {
        id: projectData.id || proj.id,
        title: projectData.songInfo?.title || projectData.title,
        artist: projectData.songInfo?.artist || projectData.artist,
        producer: projectData.songInfo?.producer || projectData.producer,
        updatedAt: projectData.updatedAt || proj.lastModified?.toISOString() || new Date().toISOString(),
        createdAt: projectData.createdAt || proj.createdAt?.toISOString(),
        type: projectData.type || 'single',
        hasCloudSync: false, // TODO: verificar se tem sync na nuvem
      };
    });

    // 3. Tentar carregar da nuvem para completar lista
    const currentUserId = userId || getCurrentUserId();
    if (currentUserId) {
      try {
        const { loadProjectsFromCloud } = await import('./supabase');
        const cloudProjects = await loadProjectsFromCloud(currentUserId);
        
        // Merge: adicionar projetos da nuvem que não estão locais
        for (const cloudProj of cloudProjects) {
          const exists = savedProjects.find((p) => p.id === cloudProj.id);
          if (!exists) {
            savedProjects.push({
              id: cloudProj.id,
              title: cloudProj.title || cloudProj.data?.songInfo?.title,
              artist: cloudProj.artist || cloudProj.data?.songInfo?.artist,
              producer: cloudProj.producer || cloudProj.data?.songInfo?.producer,
              updatedAt: cloudProj.updated_at || cloudProj.updatedAt || new Date().toISOString(),
              createdAt: cloudProj.created_at || cloudProj.createdAt,
              type: cloudProj.data?.type || 'single',
              hasCloudSync: true,
            });
          } else {
            // Marcar como sincronizado
            exists.hasCloudSync = true;
          }
        }
      } catch (error) {
        console.warn('Erro ao carregar projetos da nuvem:', error);
      }
    }

    // Ordenar por data de atualização (mais recente primeiro)
    savedProjects.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return savedProjects;
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    return [];
  }
}

/**
 * Remove projeto (local + cloud)
 */
export async function deleteProject(
  projectId: string,
  userId?: string
): Promise<void> {
  try {
    // 1. Deletar local
    await deleteProjectFromIndexedDB(projectId);

    // 2. Deletar da nuvem se usuário autenticado
    const currentUserId = userId || getCurrentUserId();
    if (currentUserId) {
      try {
        const { supabase } = await import('./supabase');
        await supabase
          .from('projects')
          .delete()
          .eq('id', projectId)
          .eq('user_id', currentUserId);
      } catch (error) {
        console.warn('Erro ao deletar da nuvem:', error);
        // Não falhar se cloud delete falhar
      }
    }
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    throw error;
  }
}

/**
 * Duplica projeto
 */
export async function duplicateProject(
  projectId: string,
  newName?: string
): Promise<string> {
  try {
    const project = await loadProject(projectId);
    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    const duplicated: ProjectState = {
      ...project,
      id: `projeto-${Date.now()}`,
      songInfo: {
        ...project.songInfo,
        title: newName || `${project.songInfo.title} (cópia)`,
      },
      updatedAt: new Date().toISOString(),
    };

    return await saveProject(duplicated);
  } catch (error) {
    console.error('Erro ao duplicar projeto:', error);
    throw error;
  }
}

