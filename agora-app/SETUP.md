# Setup do Mobile App - Agora

Guia completo de configuração do app React Native para a stack 2026.

## 📋 Checklist de Setup

- [ ] Node.js 18+ instalado
- [ ] React Native CLI instalado (`npm install -g react-native-cli`)
- [ ] Conta no Supabase criada
- [ ] Projeto Supabase criado
- [ ] Projeto Vercel deployado (ou servidor local rodando)
- [ ] Variáveis de ambiente configuradas

## 🔧 Passo a Passo

### 1. Instalar Dependências

```bash
cd mobile-app
npm install
```

### 2. Configurar Supabase

1. Acesse https://app.supabase.com
2. Crie um novo projeto ou selecione um existente
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (começa com `eyJ...`)

### 3. Configurar Variáveis de Ambiente

**Opção A: Usando react-native-config (Recomendado)**

```bash
npm install react-native-config
```

Crie arquivo `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
API_BASE_URL=https://your-project.vercel.app/api
```

**Opção B: Configuração Manual**

Edite diretamente os arquivos:
- `src/lib/supabase.ts` - URLs do Supabase
- `src/services/api.ts` - URL da API

### 4. Configurar API

**Para Desenvolvimento Local:**

1. Na raiz do projeto, execute:
   ```bash
   npm run dev:web
   ```
2. Use a URL: `http://localhost:3000/api`
   - Para Android emulador: `http://10.0.2.2:3000/api`

**Para Produção:**

Use a URL do seu projeto Vercel: `https://your-project.vercel.app/api`

### 5. Instalar Dependências Nativas (iOS)

```bash
cd ios
pod install
cd ..
```

### 6. Executar o App

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

## 🔐 Autenticação

O app usa Supabase Auth. O registro e login são gerenciados automaticamente:

- **Registro**: Cria conta no Supabase
- **Login**: Autentica via Supabase e obtém token
- **Sessão**: Persistida automaticamente no AsyncStorage
- **API**: Token enviado em todas as requisições

## 📱 Funcionalidades

### Eventos e Shows

O app permite visualizar:
- Lista de eventos públicos
- Detalhes de cada evento
- Progresso do planeamento
- Timeline de etapas

### Singles e Projetos

- Lista de singles em produção
- Detalhes e progresso
- Informações do projeto

### Feat

- Solicitar featuring/produção
- Acompanhar pedidos

### NFC

- Ler tags NFC
- Acessar conteúdo digital

## 🐛 Troubleshooting Comum

### Erro de conexão com API

**Android Emulator:**
```env
API_BASE_URL=http://10.0.2.2:3000/api
```

**iOS Simulator:**
```env
API_BASE_URL=http://localhost:3000/api
```

### Erro de autenticação Supabase

1. Verifique se as credenciais estão corretas
2. Verifique se o projeto Supabase está ativo
3. Verifique as políticas RLS no Supabase

### Erro "Unable to resolve module"

```bash
npm start -- --reset-cache
rm -rf node_modules
npm install
```

### Erro no iOS com CocoaPods

```bash
cd ios
pod deintegrate
pod install
cd ..
```

## 📚 Recursos

- [Documentação React Native](https://reactnative.dev/)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Vercel](https://vercel.com/docs)

## 🎯 Próximos Passos

Após o setup inicial:
1. Testar autenticação (registro/login)
2. Verificar listagem de eventos
3. Testar leitura NFC (se disponível)
4. Configurar push notifications (futuro)

---

**Stack 2026: Web App + React Native App + Vercel Hobby**
