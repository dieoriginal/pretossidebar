# Quick Start - Como Executar o Projeto

## ⚠️ Instalação Inicial

### 1. Instalar Dependências (Raiz)

```bash
npm install
```

### 2. Instalar Dependências dos Workspaces

```bash
# Instalar no web app
cd apps/web
npm install

# Instalar no mobile app
cd ../../apps/mobile
npm install

# Instalar no shared-logic
cd ../../packages/shared-logic
npm install

# Voltar para raiz
cd ../..
```

Ou execute tudo de uma vez:
```bash
npm run install:all
```

## 🚀 Executar o Projeto

### Opção 1: Usando Scripts da Raiz

```bash
# Web app
npm run dev:web

# Mobile app
npm run dev:mobile
```

### Opção 2: Executar Diretamente

```bash
# Web app
cd apps/web
npm run dev

# Mobile app (em outro terminal)
cd apps/mobile
npm run start
```

### Opção 3: Usando Turbo (quando instalado)

```bash
npm install turbo --save-dev
npm run dev
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Criar `.env.local` na raiz ou em `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
STRIPE_SECRET_KEY=your_stripe_secret
NEXT_PUBLIC_APP_URL=http://localhost:3006
```

### 2. Executar Schema do Supabase

Executar `supabase-schema.sql` no SQL Editor do Supabase Dashboard.

## ✅ Verificar Instalação

### Web App
```bash
cd apps/web
npm run dev
# Deve abrir em http://localhost:3006
```

### Mobile App
```bash
cd apps/mobile
npm run start
# Deve abrir Expo
```

## 🐛 Troubleshooting

### Erro: "turbo: command not found"
- **Solução**: Use `npm run dev:web` ou `npm run dev:mobile`
- Ou instale turbo: `npm install turbo --save-dev`

### Erro: "module not found"
- **Solução**: Execute `npm run install:all` na raiz
- Ou instale manualmente em cada workspace

### Erro: "shared-logic not found"
- **Solução**: Verifique que `packages/shared-logic` tem `package.json`
- Execute `npm install` na raiz

### Erro: Porta em uso
- **Solução**: Pare outros processos ou mude a porta no `package.json`## 📝 Notas- Os scripts da raiz usam comandos diretos (não dependem do Turbo)
- Turbo é opcional, mas recomendado para builds paralelos
- Cada workspace tem seu próprio `package.json`
