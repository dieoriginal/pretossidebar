# 🔧 Fix para Erro de Deploy no Vercel

## Problema

O Vercel está tentando fazer deploy do repositório `Boleia-Infraestruturas`, mas não encontra o `package.json` na raiz:

```
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '/vercel/path0/package.json'
```

## Possíveis Causas

1. **Repositório errado**: O Vercel está configurado para fazer deploy do repositório `Boleia-Infraestruturas` que não contém o código do projeto
2. **Projeto em subdiretório**: O projeto está em um subdiretório dentro do repositório `Boleia-Infraestruturas`
3. **Configuração incorreta**: O Vercel não está apontando para o diretório correto

## Soluções

### Solução 1: Verificar Repositório no Vercel

1. Acesse o dashboard do Vercel: https://vercel.com/dashboard
2. Vá para o projeto que está falhando
3. Vá em **Settings** → **Git**
4. Verifique qual repositório está conectado
5. Se for `Boleia-Infraestruturas`, você tem duas opções:
   - **Opção A**: Conectar o repositório correto (`pretossidebar` ou outro)
   - **Opção B**: Se o projeto está em `Boleia-Infraestruturas`, configurar o `rootDirectory`

### Solução 2: Configurar Root Directory (se projeto está em subdiretório)

Se o projeto está em um subdiretório dentro de `Boleia-Infraestruturas`, atualize o `vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev:web",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "rootDirectory": "./caminho/para/o/projeto",
  "regions": ["iad1"]
}
```

Ou configure diretamente no dashboard do Vercel:
1. **Settings** → **General**
2. Em **Root Directory**, especifique o caminho do subdiretório (ex: `./web`, `./frontend`, `./app`)

### Solução 3: Conectar Repositório Correto

Se o código está em outro repositório:

1. No dashboard do Vercel, vá em **Settings** → **Git**
2. Clique em **Disconnect** no repositório atual
3. Clique em **Connect Git Repository**
4. Selecione o repositório correto (provavelmente `pretossidebar` ou similar)
5. Configure o branch (geralmente `main` ou `master`)
6. O Vercel detectará automaticamente o `package.json` na raiz

### Solução 4: Verificar Estrutura do Repositório

Se você tem acesso ao repositório `Boleia-Infraestruturas`, verifique:

```bash
# Clone o repositório
git clone https://github.com/dieoriginal/Boleia-Infraestruturas
cd Boleia-Infraestruturas

# Verifique a estrutura
ls -la

# Se o package.json estiver em um subdiretório
find . -name "package.json" -type f
```

## Configuração Recomendada

O `vercel.json` foi criado na raiz do projeto. Se o projeto está na raiz do repositório, o Vercel deve detectar automaticamente.

Se ainda assim não funcionar, verifique:

1. ✅ O `package.json` está na raiz do repositório conectado?
2. ✅ O repositório correto está conectado no Vercel?
3. ✅ O branch correto está configurado?
4. ✅ As variáveis de ambiente estão configuradas?

## Próximos Passos

1. **Verificar no Dashboard do Vercel** qual repositório está conectado
2. **Se for o repositório errado**: Conectar o repositório correto
3. **Se for o repositório certo mas em subdiretório**: Configurar `rootDirectory`
4. **Fazer novo deploy** após corrigir a configuração

## Comandos Úteis

```bash
# Verificar estrutura local
ls -la

# Verificar se package.json existe
cat package.json

# Testar build localmente
npm run build

# Deploy manual via CLI
vercel --prod
```

## Suporte

Se o problema persistir:
1. Verifique os logs completos no dashboard do Vercel
2. Verifique se todas as variáveis de ambiente estão configuradas
3. Teste o build localmente primeiro: `npm run build`

