# Electron Desktop App - Guia de Desenvolvimento

## Visão Geral

Esta aplicação Next.js foi convertida para uma aplicação desktop macOS usando Electron com suporte para atualizações automáticas via GitHub Releases.

## Estrutura

```
electron/
  ├── main.ts       # Processo principal do Electron
  ├── preload.ts    # Script de preload (segurança)
  └── updater.ts    # Sistema de auto-updates
```

## Scripts Disponíveis

### Desenvolvimento
```bash
# Desenvolvimento normal (Next.js apenas)
npm run dev

# Desenvolvimento com Electron
npm run electron:dev
```

### Build
```bash
# Build do Next.js
npm run build

# Compilar TypeScript do Electron
npm run electron:compile

# Criar pacote Electron (sem DMG)
npm run electron:pack

# Criar DMG para distribuição
npm run electron:dist

# Criar apenas DMG macOS
npm run electron:dist:mac
```

## Configuração

### GitHub Releases (Auto-Updates)

1. No `package.json`, atualize a secção `build.publish`:
```json
"publish": [
  {
    "provider": "github",
    "owner": "seu-username",
    "repo": "seu-repo"
  }
]
```

2. Configure o GitHub Token:
   - Vá para GitHub Settings > Developer settings > Personal access tokens
   - Crie um token com permissão `repo`
   - Configure como variável de ambiente: `GH_TOKEN=seu_token`

3. Criar Release:
   ```bash
   # Build da aplicação
   npm run electron:dist
   
   # O electron-builder criará automaticamente um release no GitHub
   # ou você pode fazer manualmente:
   # 1. Crie um release no GitHub
   # 2. Faça upload do DMG criado em /release/
   ```

### Code Signing (Opcional mas Recomendado)

Para distribuição pública no macOS, você precisa assinar a aplicação:

1. Obtenha um certificado Apple Developer
2. Configure no `package.json`:
```json
"mac": {
  "identity": "Developer ID Application: Seu Nome (TEAM_ID)"
}
```

3. Configure variáveis de ambiente:
```bash
export APPLE_ID="seu@email.com"
export APPLE_ID_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="TEAM_ID"
```

## Como Funciona

### Modo Desenvolvimento
- Next.js roda em `http://localhost:3000`
- Electron abre uma janela apontando para essa URL
- Hot-reload funciona normalmente

### Modo Produção
- Next.js é construído como `standalone`
- Electron inicia um servidor Next.js local
- A aplicação funciona completamente offline

### Auto-Updates
- Verifica GitHub Releases na inicialização
- Verifica a cada hora automaticamente
- Mostra diálogo quando atualização está disponível
- Download e instalação automáticos

## APIs Disponíveis na Aplicação

A aplicação React pode usar:

```typescript
import { isElectron, getAppVersion, checkForUpdates } from '@/lib/electron';

// Detectar se está em Electron
if (isElectron) {
  // Código específico do Electron
}

// Obter versão
const version = await getAppVersion();

// Verificar atualizações manualmente
const result = await checkForUpdates();
```

## Resolução de Problemas

### Next.js standalone não encontrado
- Certifique-se de que executou `npm run build` antes de `npm run electron:dist`

### Porta já em uso
- O código tenta automaticamente encontrar uma porta disponível
- Se persistir, feche outras instâncias da aplicação

### Atualizações não funcionam
- Verifique se o GitHub token está configurado
- Verifique se o repositório está correto no `package.json`
- Certifique-se de que as releases seguem o formato correto (ex: `v0.1.0`)

### Erro de permissões no macOS
- Se não assinado, usuários precisarão permitir manualmente em System Preferences > Security & Privacy
- Recomenda-se assinar a aplicação para evitar isso

## Build para Distribuição

1. **Incrementar versão** no `package.json`
2. **Build da aplicação**:
   ```bash
   npm run build
   npm run electron:compile
   npm run electron:dist
   ```
3. **DMG será criado** em `/release/`
4. **Upload para GitHub Release** (manual ou automático se configurado)

## Notas Importantes

- A aplicação funciona completamente offline após o primeiro build
- IndexedDB e localStorage funcionam normalmente
- Clerk authentication pode precisar ajustes para redirects em Electron
- Service Workers podem precisar configuração adicional

