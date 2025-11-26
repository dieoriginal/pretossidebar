import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  ipc: {
    invoke: (channel: string, ...args: any[]) => {
      // Whitelist channels for security
      const validChannels = ['get-app-version', 'check-for-updates'];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      throw new Error(`Invalid IPC channel: ${channel}`);
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      const validChannels = ['update-available', 'update-downloaded', 'update-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    removeListener: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.removeListener(channel, func);
    },
  },
  isElectron: true,
});

// Type declaration for TypeScript
declare global {
  interface Window {
    electron: {
      platform: string;
      versions: {
        node: string;
        chrome: string;
        electron: string;
      };
      ipc: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        on: (channel: string, func: (...args: any[]) => void) => void;
        removeListener: (channel: string, func: (...args: any[]) => void) => void;
      };
      isElectron: boolean;
    };
  }
}

