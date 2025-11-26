/**
 * Electron helper utilities
 * Detects if running in Electron environment and provides Electron-specific APIs
 */

export const isElectron = typeof window !== 'undefined' && window.electron?.isElectron;

export const electronPlatform = isElectron ? window.electron?.platform : null;

export const electronVersions = isElectron ? window.electron?.versions : null;

/**
 * Get app version (Electron only)
 */
export async function getAppVersion(): Promise<string | null> {
  if (!isElectron) return null;
  
  try {
    const version = await window.electron.ipc.invoke('get-app-version');
    return version;
  } catch (error) {
    console.error('Error getting app version:', error);
    return null;
  }
}

/**
 * Check for updates (Electron only)
 */
export async function checkForUpdates(): Promise<{ success?: boolean; error?: string }> {
  if (!isElectron) {
    return { error: 'Not running in Electron' };
  }
  
  try {
    const result = await window.electron.ipc.invoke('check-for-updates');
    return result;
  } catch (error) {
    return { error: (error as Error).message };
  }
}

/**
 * Listen to update events (Electron only)
 */
export function onUpdateAvailable(
  callback: (data: { version: string; releaseNotes?: string }) => void
): () => void {
  if (!isElectron) return () => {};
  
  window.electron.ipc.on('update-available', callback);
  
  return () => {
    window.electron.ipc.removeListener('update-available', callback);
  };
}

export function onUpdateDownloaded(
  callback: (data: { version: string }) => void
): () => void {
  if (!isElectron) return () => {};
  
  window.electron.ipc.on('update-downloaded', callback);
  
  return () => {
    window.electron.ipc.removeListener('update-downloaded', callback);
  };
}

export function onUpdateProgress(
  callback: (data: { percent: number; transferred: number; total: number }) => void
): () => void {
  if (!isElectron) return () => {};
  
  window.electron.ipc.on('update-progress', callback);
  
  return () => {
    window.electron.ipc.removeListener('update-progress', callback);
  };
}

export function onUpdateError(
  callback: (data: { error: string }) => void
): () => void {
  if (!isElectron) return () => {};
  
  window.electron.ipc.on('update-error', callback);
  
  return () => {
    window.electron.ipc.removeListener('update-error', callback);
  };
}

