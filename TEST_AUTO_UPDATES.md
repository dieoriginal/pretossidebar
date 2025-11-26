# 🧪 Como Testar Auto-Updates

## ✅ Status Atual

- ✅ Release v0.1.0 criada no GitHub
- ✅ DMGs anexados à release
- ✅ Auto-updates configurados

**Release URL**: https://github.com/dieoriginal/pretossidebar/releases/tag/v0.1.0

## 🧪 Teste de Auto-Updates

### Método 1: Teste Completo (Recomendado)

1. **Instalar versão atual (v0.1.0):**
   ```bash
   open release/Faz\ Teu\ Mambo-0.1.0.dmg
   ```
   - Arrasta para Applications
   - Abre a aplicação

2. **Criar nova versão de teste:**
   ```bash
   # Editar package.json: mudar "version": "0.1.0" para "0.1.1"
   # Ou usar npm version
   npm version patch --no-git-tag-version
   
   # Rebuild
   npm run build && npm run electron:compile && npm run electron:dist
   
   # Criar nova release
   node scripts/create-github-release.js
   ```

3. **Testar atualização:**
   - Abre a aplicação instalada (v0.1.0)
   - A aplicação verifica atualizações automaticamente a cada hora
   - Ou força verificação: usa a API `checkForUpdates()` na aplicação
   - Deve aparecer um diálogo informando sobre a nova versão

### Método 2: Teste Rápido (Simular)

1. **Abrir aplicação instalada**
2. **Abrir DevTools** (se disponível) ou verificar logs
3. **Verificar logs de atualização:**
   ```bash
   # Logs do Electron
   tail -f ~/Library/Logs/Faz\ Teu\ Mambo/main.log
   ```

4. **Forçar verificação manualmente:**
   - Na aplicação, abre o console do browser (se possível)
   - Executa: `window.electron.ipc.invoke('check-for-updates')`

### Método 3: Verificar Configuração

Verifica se a aplicação está configurada corretamente:

1. **Verificar package.json:**
   ```bash
   node -p "require('./package.json').build.publish"
   ```
   Deve mostrar:
   ```json
   [{
     "provider": "github",
     "owner": "dieoriginal",
     "repo": "pretossidebar"
   }]
   ```

2. **Verificar release no GitHub:**
   ```bash
   curl https://api.github.com/repos/dieoriginal/pretossidebar/releases/latest | jq '.tag_name, .assets[].name'
   ```

3. **Verificar se latest-mac.yml existe:**
   - O electron-builder cria automaticamente este ficheiro
   - Deve estar na release do GitHub
   - Contém informações sobre a versão mais recente

## 🔍 Verificar se Auto-Updates Estão Funcionando

### Na Aplicação

A aplicação verifica atualizações:
- **Na inicialização** (quando abre)
- **A cada hora** automaticamente
- **Manual** via API (se implementado na UI)

### Logs

Verifica os logs para ver tentativas de atualização:

```bash
# macOS
tail -f ~/Library/Logs/Faz\ Teu\ Mambo/main.log

# Ou via Console.app
# Abre Console.app > Filtrar por "Faz Teu Mambo"
```

### Teste Manual via API

Se tiveres acesso ao console da aplicação:

```javascript
// Verificar versão atual
await window.electron.ipc.invoke('get-app-version')

// Verificar atualizações manualmente
await window.electron.ipc.invoke('check-for-updates')

// Ouvir eventos de atualização
window.electron.ipc.on('update-available', (data) => {
  console.log('Nova versão disponível:', data);
});
```

## 📝 Checklist de Teste

- [ ] Aplicação v0.1.0 instalada e funcionando
- [ ] Nova release v0.1.1 criada no GitHub
- [ ] DMGs da nova versão anexados à release
- [ ] Aplicação detecta nova versão (verificar logs)
- [ ] Diálogo de atualização aparece
- [ ] Download da atualização funciona
- [ ] Instalação da atualização funciona
- [ ] Aplicação reinicia com nova versão

## 🐛 Troubleshooting

### Aplicação não detecta atualizações

**Verificar:**
1. Tag da release corresponde à versão? (ex: v0.1.1)
2. DMGs estão anexados à release?
3. Repositório está correto no package.json?
4. Aplicação está em modo produção (não desenvolvimento)?

**Solução:**
```bash
# Verificar release mais recente
curl https://api.github.com/repos/dieoriginal/pretossidebar/releases/latest

# Verificar se latest-mac.yml existe
gh release view v0.1.1 --json assets --jq '.assets[] | select(.name | contains("latest"))'
```

### Erro "Update check failed"

**Possíveis causas:**
- Token GitHub expirado ou sem permissões
- Repositório privado sem token configurado
- Problemas de rede

**Solução:**
- Verifica logs: `~/Library/Logs/Faz Teu Mambo/main.log`
- Verifica se a release está pública
- Verifica se o token tem permissão `repo`

### Download falha

**Verificar:**
- Espaço em disco suficiente
- Permissões de escrita
- Firewall/antivírus bloqueando

## 🎯 Próximos Passos Após Teste

1. Se tudo funcionar: ✅ Auto-updates estão ativos!
2. Se houver problemas: verificar logs e ajustar configuração
3. Para produção: considerar code signing para evitar avisos de segurança

