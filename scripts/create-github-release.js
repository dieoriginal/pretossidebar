#!/usr/bin/env node

/**
 * Script para criar GitHub Release e fazer upload dos DMGs
 * Uso: node scripts/create-github-release.js [--token GH_TOKEN]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const GITHUB_OWNER = 'dieoriginal';
const GITHUB_REPO = 'pretossidebar';

// Obter versão do package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const VERSION = packageJson.version;
const TAG = `v${VERSION}`;

// Obter token (variável de ambiente ou argumento)
const GH_TOKEN = process.env.GH_TOKEN || process.argv.find(arg => arg.startsWith('--token='))?.split('=')[1];

if (!GH_TOKEN) {
  console.error('❌ GH_TOKEN não encontrado!');
  console.error('');
  console.error('Configure de uma das formas:');
  console.error('1. Variável de ambiente: export GH_TOKEN=ghp_xxx');
  console.error('2. Argumento: node scripts/create-github-release.js --token=ghp_xxx');
  console.error('');
  console.error('Para criar um token:');
  console.error('https://github.com/settings/tokens');
  console.error('Permissão necessária: repo (Full control)');
  process.exit(1);
}

// Verificar se os DMGs existem
const dmgFiles = [
  `release/Faz Teu Mambo-${VERSION}.dmg`,
  `release/Faz Teu Mambo-${VERSION}-arm64.dmg`,
].filter(file => fs.existsSync(file));

if (dmgFiles.length === 0) {
  console.error('❌ Nenhum DMG encontrado em release/');
  console.error('Execute primeiro: npm run build && npm run electron:compile && npm run electron:dist');
  process.exit(1);
}

console.log(`🚀 Criando release ${TAG} para ${GITHUB_OWNER}/${GITHUB_REPO}`);
console.log(`📦 DMGs encontrados: ${dmgFiles.length}`);
dmgFiles.forEach(file => console.log(`   - ${file}`));
console.log('');

// Função para fazer requisições HTTPS
function githubRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `token ${GH_TOKEN}`,
        'User-Agent': 'Faz-Te-Mambo-Release-Script',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`GitHub API Error (${res.statusCode}): ${parsed.message || body}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject(new Error(`GitHub API Error (${res.statusCode}): ${body}`));
          }
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Função para fazer upload de ficheiro
function uploadAsset(releaseId, filePath) {
  return new Promise((resolve, reject) => {
    const fileName = path.basename(filePath);
    const fileSize = fs.statSync(filePath).size;
    const fileStream = fs.createReadStream(filePath);

    // Obter URL de upload
    githubRequest('GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/${releaseId}`)
      .then(release => {
        const uploadUrl = release.upload_url.replace('{?name,label}', `?name=${encodeURIComponent(fileName)}`);

        const options = {
          hostname: 'uploads.github.com',
          port: 443,
          path: uploadUrl.replace('https://uploads.github.com', ''),
          method: 'POST',
          headers: {
            'Authorization': `token ${GH_TOKEN}`,
            'User-Agent': 'Faz-Te-Mambo-Release-Script',
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/octet-stream',
            'Content-Length': fileSize,
          },
        };

        const req = https.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => { body += chunk; });
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`   ✅ ${fileName} (${(fileSize / 1024 / 1024).toFixed(1)} MB)`);
              resolve(JSON.parse(body));
            } else {
              reject(new Error(`Upload failed (${res.statusCode}): ${body}`));
            }
          });
        });

        req.on('error', reject);
        fileStream.pipe(req);
      })
      .catch(reject);
  });
}

// Criar release
async function createRelease() {
  try {
    // Verificar se release já existe
    console.log('🔍 Verificando se release já existe...');
    try {
      const existing = await githubRequest('GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tags/${TAG}`);
      console.log(`⚠️  Release ${TAG} já existe!`);
      console.log(`   URL: ${existing.html_url}`);
      console.log('');
      console.log('Desejas:');
      console.log('1. Fazer upload dos DMGs para esta release existente');
      console.log('2. Criar uma nova release');
      console.log('');
      console.log('Para fazer upload, os ficheiros devem ser adicionados manualmente via GitHub UI.');
      console.log(`Ou deleta a release existente e executa este script novamente.`);
      return;
    } catch (e) {
      // Release não existe, continuar
    }

    // Criar release
    console.log(`📝 Criando release ${TAG}...`);
    const release = await githubRequest('POST', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`, {
      tag_name: TAG,
      name: `${TAG} - Faz Teu Mambo Desktop App`,
      body: `## Faz Teu Mambo Desktop App ${VERSION}

### 📦 Downloads

- **Intel (x64)**: Faz Teu Mambo-${VERSION}.dmg
- **Apple Silicon (ARM64)**: Faz Teu Mambo-${VERSION}-arm64.dmg

### 🚀 Auto-Updates

Esta release suporta atualizações automáticas. A aplicação verificará automaticamente por novas versões.

### 📝 Notas

- Primeira versão desktop da aplicação
- Suporta macOS Intel e Apple Silicon
- Auto-updates via GitHub Releases

### 🔧 Instalação

1. Abre o DMG
2. Arrasta "Faz Teu Mambo.app" para Applications
3. Abre a aplicação a partir de Applications

**Nota**: Se receberes um aviso de segurança, vai a System Preferences > Security & Privacy e permite a aplicação.`,
      draft: false,
      prerelease: false,
    });

    console.log(`✅ Release criada: ${release.html_url}`);
    console.log('');

    // Fazer upload dos DMGs
    console.log('📤 Fazendo upload dos DMGs...');
    for (const filePath of dmgFiles) {
      try {
        await uploadAsset(release.id, filePath);
      } catch (error) {
        console.error(`   ❌ Erro ao fazer upload de ${path.basename(filePath)}:`, error.message);
      }
    }

    console.log('');
    console.log('✅ Release criada com sucesso!');
    console.log(`🔗 URL: ${release.html_url}`);
    console.log('');
    console.log('🎉 Auto-updates estão agora ativos!');
    console.log('   A aplicação verificará automaticamente por atualizações.');

  } catch (error) {
    console.error('❌ Erro ao criar release:', error.message);
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('');
      console.error('💡 Dica: Verifica se o token tem permissão "repo"');
    }
    process.exit(1);
  }
}

createRelease();

