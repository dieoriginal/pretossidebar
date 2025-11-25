/**
 * Sistema de Backup Automático
 * Faz backup dos dados do usuário periodicamente
 */

import { ProjectState } from '@/hooks/use-project';
import { EventData } from '@/hooks/use-events';
import { getAllProjectsFromIndexedDB } from './db';
import { getAllEventsFromIndexedDB } from './events-db';

export interface BackupData {
  userId: string;
  timestamp: Date;
  projects: ProjectState[];
  events: EventData[];
  version: string;
}

const BACKUP_KEY_PREFIX = 'pretos_music_backup_';
const MAX_BACKUPS = 5; // Manter últimos 5 backups

/**
 * Cria um backup completo dos dados do usuário
 */
export async function createBackup(userId: string): Promise<BackupData> {
  try {
    const [projects, events] = await Promise.all([
      getAllProjectsFromIndexedDB() as Promise<ProjectState[]>,
      getAllEventsFromIndexedDB() as Promise<EventData[]>,
    ]);

    // Filtrar apenas dados do usuário
    const userProjects = projects.filter(p => p.userId === userId);
    const userEvents = events.filter(e => e.userId === userId);

    const backup: BackupData = {
      userId,
      timestamp: new Date(),
      projects: userProjects,
      events: userEvents,
      version: '1.0.0',
    };

    // Guardar backup no localStorage
    await saveBackupToStorage(userId, backup);

    return backup;
  } catch (error) {
    console.error('Backup error:', error);
    throw error;
  }
}

/**
 * Guarda backup no localStorage
 */
async function saveBackupToStorage(userId: string, backup: BackupData): Promise<void> {
  const key = `${BACKUP_KEY_PREFIX}${userId}_${backup.timestamp.getTime()}`;
  const backups = getBackupKeys(userId);
  
  // Adicionar novo backup
  backups.push(key);
  
  // Manter apenas os últimos MAX_BACKUPS
  if (backups.length > MAX_BACKUPS) {
    const toRemove = backups.slice(0, backups.length - MAX_BACKUPS);
    toRemove.forEach(k => localStorage.removeItem(k));
    backups.splice(0, backups.length - MAX_BACKUPS);
  }

  localStorage.setItem(key, JSON.stringify(backup));
  localStorage.setItem(`${BACKUP_KEY_PREFIX}${userId}_keys`, JSON.stringify(backups));
}

/**
 * Obtém lista de chaves de backup
 */
function getBackupKeys(userId: string): string[] {
  const key = `${BACKUP_KEY_PREFIX}${userId}_keys`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Restaura dados de um backup
 */
export async function restoreBackup(userId: string, timestamp: number): Promise<BackupData | null> {
  const key = `${BACKUP_KEY_PREFIX}${userId}_${timestamp}`;
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    return null;
  }

  const backup: BackupData = JSON.parse(stored);
  backup.timestamp = new Date(backup.timestamp);
  
  return backup;
}

/**
 * Lista todos os backups disponíveis
 */
export function listBackups(userId: string): BackupData[] {
  const keys = getBackupKeys(userId);
  const backups: BackupData[] = [];

  for (const key of keys) {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const backup: BackupData = JSON.parse(stored);
        backup.timestamp = new Date(backup.timestamp);
        backups.push(backup);
      } catch (e) {
        console.error('Error parsing backup:', key, e);
      }
    }
  }

  return backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Elimina um backup
 */
export function deleteBackup(userId: string, timestamp: number): void {
  const key = `${BACKUP_KEY_PREFIX}${userId}_${timestamp}`;
  localStorage.removeItem(key);
  
  const keys = getBackupKeys(userId);
  const updated = keys.filter(k => k !== key);
  localStorage.setItem(`${BACKUP_KEY_PREFIX}${userId}_keys`, JSON.stringify(updated));
}

/**
 * Exporta backup como JSON para download
 */
export function exportBackupAsJSON(backup: BackupData): void {
  const dataStr = JSON.stringify(backup, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pretos_music_backup_${backup.timestamp.toISOString()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Importa backup de um ficheiro JSON
 */
export async function importBackupFromJSON(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup: BackupData = JSON.parse(e.target?.result as string);
        backup.timestamp = new Date(backup.timestamp);
        resolve(backup);
      } catch (error) {
        reject(new Error('Invalid backup file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
}

