# 🚀 Quick Start: Criar Release no GitHub

## Passo 1: Criar GitHub Token

1. Vai para: **https://github.com/settings/tokens**
2. Clica em **"Generate new token"** > **"Generate new token (classic)"**
3. Dá um nome: `electron-auto-updater`
4. Marca a permissão: **`repo`** (Full control of private repositories)
5. Clica em **"Generate token"**
6. **COPIA O TOKEN** (começa com `ghp_`)

## Passo 2: Configurar Token

```bash
# Opção 1: Temporário (apenas esta sessão)
export GH_TOKEN="ghp_seu_token_aqui"

# Opção 2: Permanente (adiciona ao ~/.zshrc)
echo 'export GH_TOKEN="ghp_seu_token_aqui"' >> ~/.zshrc
source ~/.zshrc
```

## Passo 3: Criar Release Automaticamente

```bash
# Se GH_TOKEN estiver configurado
node scripts/create-github-release.js

# Ou passar token diretamente
node scripts/create-github-release.js --token=ghp_seu_token_aqui
```

O script irá:
- ✅ Verificar se os DMGs existem
- ✅ Criar a release no GitHub
- ✅ Fazer upload automático dos DMGs
- ✅ Configurar auto-updates

## Passo 4: Testar Auto-Updates

1. **Instalar versão atual:**
   ```bash
   open release/Faz\ Teu\ Mambo-0.1.0.dmg
   ```

2. **Incrementar versão e criar nova release:**
   ```bash
   # Editar package.json: "version": "0.1.1"
   npm run build && npm run electron:compile && npm run electron:dist
   node scripts/create-github-release.js
   ```

3. **Abrir aplicação instalada** - deve detectar atualização automaticamente!

---

## Alternativa: Manual (sem token)

Se não quiseres configurar o token, podes criar a release manualmente:

1. Vai para: **https://github.com/dieoriginal/pretossidebar/releases**
2. Clica em **"Draft a new release"**
3. **Tag**: `v0.1.0` (deve corresponder à versão no package.json)
4. **Title**: `v0.1.0 - Faz Teu Mambo Desktop App`
5. **Description**: Adiciona notas da release
6. **Arrasta os DMGs** de `release/`:
   - `Faz Teu Mambo-0.1.0.dmg`
   - `Faz Teu Mambo-0.1.0-arm64.dmg`
7. Clica em **"Publish release"**

---

## Verificar se Funcionou

```bash
# Verificar release criada
curl https://api.github.com/repos/dieoriginal/pretossidebar/releases/latest

# Ou abrir no browser
open https://github.com/dieoriginal/pretossidebar/releases
```

