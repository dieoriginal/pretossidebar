// #region agent log
const fs = require('fs');
const path = require('path');

const logPath = '/Users/pretosmediagroupllc/Documents/GitHub/pretossidebar/.cursor/debug.log';
const log = (data) => {
  const entry = JSON.stringify({
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: data.hypothesisId,
    location: 'debug-entry.js',
    message: data.message,
    data: data.data,
    timestamp: Date.now()
  }) + '\n';
  fs.appendFileSync(logPath, entry);
};

// Hipótese A: Verificar se expo-router está instalado
try {
  const expoRouterPath = require.resolve('expo-router/entry');
  log({
    hypothesisId: 'A',
    message: 'expo-router/entry encontrado',
    data: { path: expoRouterPath, exists: true }
  });
} catch (e) {
  log({
    hypothesisId: 'A',
    message: 'expo-router/entry NÃO encontrado',
    data: { error: e.message, exists: false }
  });
}

// Hipótese B: Verificar resolução do módulo
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
log({
  hypothesisId: 'B',
  message: 'Campo main do package.json',
  data: { main: packageJson.main }
});

try {
  const resolved = require.resolve(packageJson.main, { paths: [__dirname] });
  log({
    hypothesisId: 'B',
    message: 'Módulo main resolvido com sucesso',
    data: { resolvedPath: resolved }
  });
} catch (e) {
  log({
    hypothesisId: 'B',
    message: 'Falha ao resolver módulo main',
    data: { error: e.message, main: packageJson.main }
  });
}

// Hipótese C: Verificar se index.js existe
const indexJsPath = path.join(__dirname, 'index.js');
const indexExists = fs.existsSync(indexJsPath);
log({
  hypothesisId: 'C',
  message: 'Verificação de index.js',
  data: { exists: indexExists, path: indexJsPath }
});

// Hipótese E: Verificar estrutura de arquivos
const appTsxPath = path.join(__dirname, 'App.tsx');
const appExists = fs.existsSync(appTsxPath);
log({
  hypothesisId: 'E',
  message: 'Verificação de App.tsx',
  data: { exists: appExists, path: appTsxPath }
});
// #endregion
