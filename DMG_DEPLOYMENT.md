# Guia Completo: Testar e Distribuir DMG com Auto-Updates

## 1. Testar o DMG

### Abrir e Testar Localmente

```bash
# Abrir o DMG
open release/Faz\ Teu\ Mambo-0.1.0.dmg

# Ou para ARM64
open release/Faz\ Teu\ Mambo-0.1.0-arm64.dmg
```

**Passos:**
1. O DMG abrirá no Finder
2. Arraste "Faz Teu Mambo.app" para a pasta Applications
3. Abra a aplicação a partir de Applications
4. Teste todas as funcionalidades principais

### Testar em Modo Desenvolvimento (com Electron)

```bash
# Terminal 1: Iniciar Next.js
npm run dev:web

# Terminal 2: Iniciar Electron (depois que Next.js estiver rodando)
npm run electron:dev
```

### Verificar Logs

Se houver problemas, verifique os logs:

```bash
# Logs do Electron
~/Library/Logs/Faz Teu Mambo/main.log

# Ou via Console.app no macOS
# Abra Console.app e filtre por "Faz Teu Mambo"
```

---

## 2. Code Signing (Opcional mas Recomendado)

### Por que Code Signing?

- Remove avisos de segurança no macOS
- Permite distribuição pública sem Gatekeeper bloqueando
- Necessário para notarização (macOS 10.15+)

### Obter Certificado Apple Developer

1. **Inscrever-se no Apple Developer Program**
   - Vai para: https://developer.apple.com/programs/
   - Custa $99/ano
   - Pode levar 24-48h para aprovação

2. **Criar Certificado**
   - Vai para: https://developer.apple.com/account/resources/certificates/list
   - Clica em "+" para criar novo certificado
   - Escolhe "Developer ID Application"
   - Segue o assistente

3. **Baixar e Instalar Certificado**
   - Baixa o certificado
   - Clica duas vezes para instalar no Keychain

### Configurar Code Signing

1. **Encontrar Team ID:**
   ```bash
   security find-identity -v -p codesigning
   ```
   Procura por algo como: `Developer ID Application: Seu Nome (TEAM_ID)`

2. **Configurar package.json:**
   ```json
   "mac": {
     "identity": "Developer ID Application: Seu Nome (TEAM_ID)",
     "hardenedRuntime": true,
     "gatekeeperAssess": false,
     "entitlements": "build/entitlements.mac.plist",
     "entitlementsInherit": "build/entitlements.mac.plist"
   }
   ```

3. **Configurar Variáveis de Ambiente (para notarização):**
   ```bash
   export APPLE_ID="seu@email.com"
   export APPLE_ID_PASSWORD="app-specific-password"  # Não a senha normal!
   export APPLE_TEAM_ID="TEAM_ID"
   ```

   **App-Specific Password:**
   - Vai para: https://appleid.apple.com/account/manage
   - Security > App-Specific Passwords
   - Cria uma nova password para "electron-builder"

4. **Rebuild com Code Signing:**
   ```bash
   npm run electron:dist
   ```

---

## 3. Configurar GitHub Token (GH_TOKEN)

### Quando é Necessário?

- Repositório privado
- Rate limits do GitHub (muitas verificações de updates)
- Upload automático de releases

### Criar Personal Access Token

1. **Vai para GitHub Settings:**
   - https://github.com/settings/tokens
   - Ou: GitHub Profile > Settings > Developer settings > Personal access tokens > Tokens (classic)

2. **Criar Novo Token:**
   - Clica em "Generate new token" > "Generate new token (classic)"
   - Dá um nome: `electron-auto-updater`
   - Expiração: escolhe (recomendo 1 ano ou sem expiração)
   - Permissões necessárias:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `write:packages` (opcional, se usar GitHub Packages)

3. **Copiar o Token:**
   - ⚠️ **IMPORTANTE:** Copia imediatamente, não poderás vê-lo novamente!

### Configurar Token

**Opção 1: Variável de Ambiente (Recomendado)**

```bash
# Adicionar ao ~/.zshrc ou ~/.bash_profile
export GH_TOKEN="ghp_seu_token_aqui"

# Recarregar
source ~/.zshrc
```

**Opção 2: .env.local (Apenas para desenvolvimento)**

```bash
# Criar .env.local na raiz do projeto
echo "GH_TOKEN=ghp_seu_token_aqui" >> .env.local
```

**Opção 3: Durante o Build**

```bash
GH_TOKEN=ghp_seu_token_aqui npm run electron:dist
```

### Verificar se Funciona

```bash
# Testar acesso ao GitHub
curl -H "Authorization: token $GH_TOKEN" https://api.github.com/user
```

---

## 4. Criar Release no GitHub com Auto-Updates

### Método 1: Manual (Mais Simples)

1. **Vai para o Repositório:**
   - https://github.com/dieoriginal/pretossidebar/releases

2. **Criar Nova Release:**
   - Clica em "Draft a new release"
   - Tag: `v0.1.0` (deve corresponder à versão no package.json)
   - Title: `v0.1.0 - Faz Teu Mambo Desktop App`
   - Description: Adiciona notas da release

3. **Upload dos DMGs:**
   - Arrasta os ficheiros:
     - `release/Faz Teu Mambo-0.1.0.dmg`
     - `release/Faz Teu Mambo-0.1.0-arm64.dmg`
   - Opcional: também podes fazer upload dos `.blockmap` files

4. **Publicar:**
   - Clica em "Publish release"

### Método 2: Automático com electron-builder (Recomendado)

Se configuraste o `GH_TOKEN`, o electron-builder pode fazer upload automaticamente:

```bash
# Build e upload automático
GH_TOKEN=ghp_seu_token_aqui npm run electron:dist
```

O electron-builder irá:
- Criar o release automaticamente
- Fazer upload dos DMGs
- Criar os ficheiros de update (latest-mac.yml)

### Estrutura de Release Esperada

Para auto-updates funcionarem, o GitHub Release deve ter:

```
v0.1.0/
├── Faz Teu Mambo-0.1.0.dmg
├── Faz Teu Mambo-0.1.0-arm64.dmg
├── latest-mac.yml (criado automaticamente pelo electron-builder)
└── Faz Teu Mambo-0.1.0.dmg.blockmap
```

### Verificar Auto-Updates

1. **Instalar versão antiga** (se tiveres)
2. **Criar nova release** com versão maior (ex: v0.1.1)
3. **Abrir a aplicação** - deve detectar a atualização automaticamente
4. **Ou verificar manualmente:**
   - A aplicação verifica a cada hora
   - Ou usa a API: `window.electron.ipc.invoke('check-for-updates')`

---

## 5. Workflow Completo de Release

### Script de Release Completo

Cria um script `scripts/release.sh`:

```bash
#!/bin/bash

# 1. Atualizar versão
VERSION=$(node -p "require('./package.json').version")
echo "Building version $VERSION"

# 2. Build
npm run build

# 3. Compilar Electron
npm run electron:compile

# 4. Criar DMG e fazer upload (se GH_TOKEN estiver configurado)
if [ -z "$GH_TOKEN" ]; then
  echo "⚠️  GH_TOKEN não configurado. Criando apenas DMG local."
  npm run electron:dist
else
  echo "✅ GH_TOKEN configurado. Fazendo upload automático."
  GH_TOKEN=$GH_TOKEN npm run electron:dist
fi

# 5. Verificar ficheiros criados
echo ""
echo "✅ Release criado!"
echo "DMGs em: release/"
ls -lh release/*.dmg

# 6. Instruções
echo ""
echo "📦 Próximos passos:"
echo "1. Testar os DMGs: open release/Faz\\ Teu\\ Mambo-${VERSION}.dmg"
echo "2. Se GH_TOKEN não estava configurado, fazer upload manual para GitHub Releases"
echo "3. Tag da release deve ser: v${VERSION}"
```

Tornar executável:
```bash
chmod +x scripts/release.sh
```

### Incrementar Versão

Antes de cada release, atualiza a versão no `package.json`:

```bash
# Usando npm version (recomendado)
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0

# Ou editar manualmente package.json
```

---

## 6. Troubleshooting

### DMG não abre / "App está danificado"

**Solução:**
```bash
# Remover quarentena do macOS
xattr -cr "release/mac/Faz Teu Mambo.app"

# Ou para o DMG
xattr -cr release/Faz\ Teu\ Mambo-0.1.0.dmg
```

### Auto-updates não funcionam

**Verificar:**
1. Tag da release corresponde à versão? (ex: v0.1.0)
2. DMGs estão anexados à release?
3. `latest-mac.yml` foi criado?
4. Repositório está correto no `package.json`?

**Testar manualmente:**
```bash
# Verificar se a release existe
curl https://api.github.com/repos/dieoriginal/pretossidebar/releases/latest
```

### Erro "Cannot find module" no Electron

**Solução:**
- Verifica se `electron/main.js` existe (compilado)
- Verifica se `.next/standalone` existe
- Rebuild: `npm run build && npm run electron:compile`

### Build muito lento

**Otimizações:**
- Usa cache: `npm run electron:dist -- --publish never` (não faz upload)
- Build apenas uma arquitetura: `npm run electron:dist:mac -- --mac --x64`

---

## 7. Checklist de Release

Antes de cada release:

- [ ] Versão atualizada no `package.json`
- [ ] Build testado localmente (`npm run electron:dev`)
- [ ] DMG testado (abrir e usar a aplicação)
- [ ] GH_TOKEN configurado (se usar upload automático)
- [ ] Code signing configurado (se quiseres distribuição pública)
- [ ] Release notes preparadas
- [ ] Tag criada no Git: `git tag v0.1.0 && git push origin v0.1.0`
- [ ] Release criada no GitHub
- [ ] Auto-updates testados (instalar versão antiga e verificar)

---

## Comandos Rápidos

```bash
# Testar DMG
open release/Faz\ Teu\ Mambo-0.1.0.dmg

# Build completo
npm run build && npm run electron:compile && npm run electron:dist

# Build com upload automático
GH_TOKEN=ghp_xxx npm run electron:dist

# Incrementar versão e criar release
npm version patch && npm run build && npm run electron:compile && npm run electron:dist
```

