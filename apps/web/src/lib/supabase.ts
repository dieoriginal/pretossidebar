/**
 * Cliente Supabase para substituir Firebase
 * Mantém compatibilidade com a estrutura existente
 */

import { createClient } from '@supabase/supabase-js';
import { deflate, inflate } from 'pako';

// Variáveis de ambiente - devem ser configuradas no .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL ou Anon Key não configurados. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local');
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Usamos Clerk para auth, não Supabase Auth
  },
});

/**
 * Sincronizar projeto para a nuvem (Supabase)
 */
export const syncProjectToCloud = async (userId: string, project: any) => {
  const payload = (project && project.data) ? project.data : project;
  const id = (project && project.id) ? project.id : 'current-project';
  const compressed = deflate(JSON.stringify(payload), { to: 'string' });

  const { error } = await supabase
    .from('projects')
    .upsert({
      id: id,
      user_id: userId,
      data: compressed,
      last_synced: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id,user_id',
    });

  if (error) {
    console.error('Erro ao sincronizar projeto:', error);
    throw error;
  }
};

/**
 * Carregar projetos da nuvem (Supabase)
 */
export const loadProjectsFromCloud = async (userId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Erro ao carregar projetos:', error);
    throw error;
  }

  return (data || []).map((doc: any) => {
    const dataStr = inflate(doc.data as string, { to: 'string' });
    return {
      id: doc.id,
      ...doc,
      data: JSON.parse(dataStr as string),
    } as any;
  });
};

/**
 * Publicar single público
 */
export const publishPublicSingle = async (payload: {
  id: string; title: string; artist?: string; featured?: string[]; producer?: string; coverUrl?: string;
}) => {
  const { error } = await supabase
    .from('public_singles')
    .upsert({
      id: payload.id,
      title: payload.title,
      artist: payload.artist || null,
      featured: payload.featured || null,
      producer: payload.producer || null,
      cover_url: payload.coverUrl || null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
    });

  if (error) {
    console.error('Erro ao publicar single:', error);
    throw error;
  }
};

/**
 * Buscar singles públicos
 */
export const fetchPublicSingles = async (): Promise<Array<{
  id: string; title: string; artist?: string; featured?: string[]; producer?: string; coverUrl?: string;
}>> => {
  const { data, error } = await supabase
    .from('public_singles')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar singles públicos:', error);
    throw error;
  }

  return (data || []).map((d: any) => ({
    id: d.id,
    title: d.title,
    artist: d.artist || undefined,
    featured: d.featured || undefined,
    producer: d.producer || undefined,
    coverUrl: d.cover_url || undefined,
  }));
};

/**
 * Salvar projeto no Supabase (compatível com saveProjectToFirebase)
 */
export const saveProjectToSupabase = async (projectId: string, projectData: any, userId: string) => {
  if (!projectData || !projectData.songInfo) {
    throw new Error("Dados do projeto incompletos");
  }

  // Comprimir dados do projeto
  const compressed = deflate(JSON.stringify(projectData), { to: 'string' });

  const { error } = await supabase
    .from('projects')
    .upsert({
      id: projectId,
      user_id: userId,
      data: compressed,
      title: projectData.songInfo.title,
      artist: projectData.songInfo.artist,
      producer: projectData.songInfo.producer,
      featuring: projectData.songInfo.featuring,
      created_at: projectData.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_synced: new Date().toISOString(),
    }, {
      onConflict: 'id,user_id',
    });

  if (error) {
    console.error("Erro ao salvar projeto no Supabase:", error);
    throw error;
  }

  console.log('Projeto salvo no Supabase com sucesso');
  return true;
};

/**
 * Buscar projetos públicos do Supabase
 */
export const fetchPublicProjects = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('public_projects')
    .select('*')
    .eq('is_public', true)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar projetos públicos:', error);
    throw error;
  }

  return (data || []).map((d: any) => ({
    id: d.id,
    data: d.data,
    isPublic: d.is_public,
    updatedAt: d.updated_at,
  }));
};

/**
 * Buscar um projeto público específico do Supabase
 */
export const fetchPublicProject = async (projectId: string): Promise<any | null> => {
  const { data, error } = await supabase
    .from('public_projects')
    .select('*')
    .eq('id', projectId)
    .eq('is_public', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Nenhum resultado encontrado
      return null;
    }
    console.error('Erro ao buscar projeto público:', error);
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    data: data.data,
    isPublic: data.is_public,
    updatedAt: data.updated_at,
  };
};/**
 * Buscar eventos públicos do Supabase
 */
export const fetchPublicEvents = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('public_events')
    .select('*')
    .eq('is_public', true)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar eventos públicos:', error);
    throw error;
  }

  return (data || []).map((d: any) => ({
    id: d.id,
    data: d.data,
    isPublic: d.is_public,
    updatedAt: d.updated_at,
  }));
};

/**
 * Buscar um evento público específico do Supabase
 */
export const fetchPublicEvent = async (eventId: string): Promise<any | null> => {
  const { data, error } = await supabase
    .from('public_events')
    .select('*')
    .eq('id', eventId)
    .eq('is_public', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Nenhum resultado encontrado
      return null;
    }
    console.error('Erro ao buscar evento público:', error);
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    data: data.data,
    isPublic: data.is_public,
    updatedAt: data.updated_at,
  };
};
