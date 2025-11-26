import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import * as fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import { setupUpdater } from './updater';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
let mainWindow: BrowserWindow | null = null;
let nextServerProcess: ChildProcess | null = null;
let serverPort = 3000;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    backgroundColor: '#0f172a',
    titleBarStyle: 'hiddenInset',
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: false,
    },
    icon: isDev 
      ? path.join(__dirname, '../public/app-icon.png')
      : path.join(process.resourcesPath, 'app.asar/public/app-icon.png'),
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL(`http://localhost:${serverPort}`);
    mainWindow.webContents.openDevTools();
  } else {
    // In production, serve from Next.js standalone server
    mainWindow.loadURL(`http://localhost:${serverPort}`);
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Setup auto-updater
  if (!isDev) {
    setupUpdater(mainWindow);
  }
}

function startNextServer(): void {
  if (isDev) {
    // In development, Next.js dev server should already be running
    console.log('Development mode: Next.js dev server should be running separately');
    return;
  }

  // In production, start Next.js standalone server
  // Try different paths for standalone build
  let nextServerPath: string;
  let serverScript: string;

  // Check if running from app bundle
  if (app.isPackaged) {
    nextServerPath = path.join(process.resourcesPath, 'app.asar', '.next', 'standalone');
    serverScript = path.join(nextServerPath, 'server.js');
  } else {
    // Development build path
    nextServerPath = path.join(__dirname, '..', '.next', 'standalone');
    serverScript = path.join(nextServerPath, 'server.js');
  }

  // Alternative: try finding it relative to app
  if (!fs.existsSync(serverScript)) {
    const altPath = path.join(process.cwd(), '.next', 'standalone');
    const altScript = path.join(altPath, 'server.js');
    if (fs.existsSync(altScript)) {
      nextServerPath = altPath;
      serverScript = altScript;
    } else {
      console.error('Next.js standalone server not found. Please build the app first.');
      console.error('Tried:', serverScript);
      console.error('Also tried:', altScript);
      app.quit();
      return;
    }
  }

  // Find available port if 3000 is taken
  const net = require('net');
  const server = net.createServer();
  server.listen(0, () => {
    serverPort = (server.address() as any).port;
    server.close(() => {
      // Set PORT environment variable for Next.js
      process.env.PORT = serverPort.toString();

      // Get the correct node path
      const nodePath = process.execPath.replace(/[^/\\]+$/, 'node');
      
      nextServerProcess = spawn('node', [serverScript], {
        cwd: nextServerPath,
        env: {
          ...process.env,
          PORT: serverPort.toString(),
          NODE_ENV: 'production',
          HOSTNAME: 'localhost',
        },
        stdio: 'inherit',
      });

      nextServerProcess.on('error', (error) => {
        console.error('Failed to start Next.js server:', error);
        dialog.showErrorBox('Erro', `Falha ao iniciar servidor: ${error.message}`);
        app.quit();
      });

      nextServerProcess.on('exit', (code) => {
        console.log(`Next.js server exited with code ${code}`);
        if (code !== 0 && code !== null) {
          app.quit();
        }
      });

      // Wait a bit for server to start before opening window
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.loadURL(`http://localhost:${serverPort}`);
        }
      }, 3000);
    });
  });
}

// App event handlers
app.whenReady().then(() => {
  if (!isDev) {
    startNextServer();
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (nextServerProcess) {
    nextServerProcess.kill();
    nextServerProcess = null;
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (nextServerProcess) {
    nextServerProcess.kill();
    nextServerProcess = null;
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('check-for-updates', async () => {
  if (isDev) {
    return { error: 'Updates only available in production' };
  }
  try {
    await autoUpdater.checkForUpdates();
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
});

// Handle app protocol for deep linking (optional)
app.setAsDefaultProtocolClient('fazteumambo', process.execPath, [
  path.resolve(process.argv[1]),
]);

