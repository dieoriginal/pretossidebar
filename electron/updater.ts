import { autoUpdater, UpdateInfo } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Configure auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Configure logging (optional)
try {
  const electronLog = require('electron-log');
  if (electronLog && autoUpdater.logger) {
    autoUpdater.logger = electronLog;
  }
} catch (e) {
  // electron-log is optional
  console.log('electron-log not available, using console for logging');
}

export function setupUpdater(mainWindow: BrowserWindow): void {
  // Check for updates on startup
  autoUpdater.checkForUpdates().catch((error) => {
    console.error('Error checking for updates:', error);
  });

  // Check for updates every hour
  setInterval(() => {
    autoUpdater.checkForUpdates().catch((error) => {
      console.error('Error checking for updates:', error);
    });
  }, 60 * 60 * 1000); // 1 hour

  // Update available
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    const message = `Uma nova versão (${info.version}) está disponível. Deseja baixar agora?`;
    
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Atualização Disponível',
      message: 'Nova Versão Disponível',
      detail: message,
      buttons: ['Baixar Agora', 'Depois'],
      defaultId: 0,
      cancelId: 1,
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
        
        // Notify renderer
        mainWindow.webContents.send('update-available', {
          version: info.version,
          releaseNotes: info.releaseNotes,
        });
      }
    });
  });

  // Update not available
  autoUpdater.on('update-not-available', () => {
    console.log('No updates available');
  });

  // Update downloaded
  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    const message = `A versão ${info.version} foi baixada. A aplicação será reiniciada para instalar a atualização.`;
    
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Atualização Pronta',
      message: 'Atualização Baixada',
      detail: message,
      buttons: ['Reiniciar Agora', 'Depois'],
      defaultId: 0,
      cancelId: 1,
    }).then((result) => {
      if (result.response === 0) {
        // Notify renderer
        mainWindow.webContents.send('update-downloaded', {
          version: info.version,
        });
        
        // Quit and install
        autoUpdater.quitAndInstall(false, true);
      }
    });
  });

  // Download progress
  autoUpdater.on('download-progress', (progressObj) => {
    const message = `Baixando atualização: ${Math.round(progressObj.percent)}%`;
    console.log(message);
    
    // Send progress to renderer
    mainWindow.webContents.send('update-progress', {
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
    });
  });

  // Error handling
  autoUpdater.on('error', (error) => {
    console.error('Error in auto-updater:', error);
    
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: 'Erro na Atualização',
      message: 'Erro ao verificar atualizações',
      detail: error.message,
      buttons: ['OK'],
    });

    // Notify renderer
    mainWindow.webContents.send('update-error', {
      error: error.message,
    });
  });

  // Configure update server (GitHub Releases)
  // This will be set from package.json build config
  // For custom server, you can set:
  // autoUpdater.setFeedURL({
  //   provider: 'generic',
  //   url: 'https://your-update-server.com/updates',
  // });
}

// Manual check function
export async function checkForUpdatesManually(): Promise<void> {
  await autoUpdater.checkForUpdates();
}

