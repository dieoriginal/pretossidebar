/**
 * Sistema de Multi-tenancy
 * Isola dados por userId do Clerk
 */

import { ProjectState } from '@/hooks/use-project';
import { EventData } from '@/hooks/use-events';

/**
 * Adiciona userId a qualquer dado antes de salvar
 */
export function addUserIdToData<T extends { userId?: string }>(
  data: T,
  userId: string
): T & { userId: string } {
  return {
    ...data,
    userId,
  };
}

/**
 * Filtra dados por userId
 */
export function filterByUserId<T extends { userId?: string }>(
  items: T[],
  userId: string
): T[] {
  return items.filter(item => item.userId === userId);
}

/**
 * Verifica se o dado pertence ao usuário
 */
export function belongsToUser<T extends { userId?: string }>(
  item: T,
  userId: string
): boolean {
  return item.userId === userId;
}

/**
 * Normaliza dados antigos (sem userId) para incluir userId
 */
export function normalizeDataWithUserId<T extends { userId?: string }>(
  data: T,
  userId: string
): T & { userId: string } {
  if (data.userId && data.userId !== userId) {
    throw new Error('Data does not belong to user');
  }
  return {
    ...data,
    userId,
  };
}

/**
 * Helper para queries de projetos
 */
export function getUserProjects(
  projects: ProjectState[],
  userId: string
): ProjectState[] {
  return filterByUserId(projects, userId);
}

/**
 * Helper para queries de eventos
 */
export function getUserEvents(
  events: EventData[],
  userId: string
): EventData[] {
  return filterByUserId(events, userId);
}

