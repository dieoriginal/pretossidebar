# Agora Mobile App

App React Native para Android e iOS que permite aos fãs acompanhar o progresso dos projetos, eventos e shows do artista.

## 🎯 Stack 2026

- **React Native** 0.72.6
- **Supabase** para autenticação e backend
- **Vercel** para API (Next.js API Routes)
- **React Navigation** para navegação
- **TypeScript** para type safety

## 📱 Funcionalidades

- ✅ Autenticação de fãs com Supabase Auth
- ✅ Visualização de progresso de singles em produção
- ✅ Visualização de eventos e shows planeados
- ✅ Sistema de Feat (solicitar featuring/produção com pagamento)
- ✅ Leitura de tags NFC para aceder a conteúdo digital
- ✅ Navegação com React Navigation (Stack + Bottom Tabs)
- ✅ Armazenamento local com AsyncStorage
- ✅ Sistema de notificações Toast

## 📋 Pré-requisitos

- Node.js 18+ e npm/yarn
- React Native CLI: `npm install -g react-native-cli`
- Para iOS: Xcode e CocoaPods (`sudo gem install cocoapods`)
- Para Android: Android Studio e Android SDK
- Conta no Supabase (https://app.supabase.com)
- Projeto Vercel deployado (ou servidor local)

## 🚀 Setup

### 1. Instalar dependências

```bash
cd agora-app
npm install
# ou
yarn install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `agora-app/`:

```env
# Supabase Configuration
# Obtenha essas credenciais em https://app.supabase.com
# Settings > API > Project URL e anon public key
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
# Use a URL do seu projeto Vercel ou localhost para desenvolvimento
EXPO_PUBLIC_API_URL=https://your-project.vercel.app/api
# Para desenvolvimento local, use:
# EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

**Nota**: Para usar variáveis de ambiente no React Native, você precisará de uma das seguintes opções:

#### Opção 1: react-native-config (Recomendado)

```bash
npm install react-native-config
```

E use `react-native-config` no código:
```typescript
import Config from 'react-native-config';
const API_URL = Config.API_BASE_URL;
```

#### Opção 2: Expo (se estiver usando Expo)

As variáveis `EXPO_PUBLIC_*` funcionam automaticamente com Expo.

#### Opção 3: Configuração manual

Edite diretamente `src/services/api.ts` e `src/lib/supabase.ts` com suas URLs.

### 3. Configurar Supabase

1. Acesse https://app.supabase.com
2. Crie um projeto (ou use um existente)
3. Vá em **Settings** → **API**
4. Copie a **Project URL** e a **anon public** key
5. Cole no arquivo `.env`

### 4. Instalar dependências nativas (iOS)

```bash
cd ios && pod install && cd ..
```

### 5. Executar o app

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

**Metro Bundler:**
```bash
npm start
```

## 📁 Estrutura do Projeto

```
agora-app/
├── App.tsx                 # Componente principal
├── index.js               # Entry point
├── src/
│   ├── screens/          # Telas da aplicação
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── SinglesScreen.tsx
│   │   ├── SingleDetailScreen.tsx
│   │   ├── EventsScreen.tsx
│   │   ├── EventDetailScreen.tsx
│   │   ├── FeatScreen.tsx
│   │   └── NFCScreen.tsx
│   ├── components/       # Componentes reutilizáveis
│   │   ├── ProgressCard.tsx
│   │   └── ProjectTimeline.tsx
│   ├── contexts/         # Contextos React
│   │   ├── AuthContext.tsx (Supabase Auth)
│   │   └── ToastContext.tsx
│   ├── services/         # Serviços
│   │   └── api.ts       # Cliente API
│   └── lib/             # Bibliotecas
│       └── supabase.ts  # Cliente Supabase
├── babel.config.js       # Configuração Babel
├── tsconfig.json         # Configuração TypeScript
├── metro.config.js       # Configuração Metro
└── package.json          # Dependências
```

## ⚙️ Configuração

### API Base URL

A URL base da API pode ser configurada através de variáveis de ambiente ou editando diretamente `src/services/api.ts`. 

**Para desenvolvimento local:**
- Certifique-se de que o servidor Next.js está rodando: `npm run dev:web` (na raiz do projeto)
- Use: `http://localhost:3000/api` ou `http://10.0.2.2:3000/api` (Android emulador)

**Para produção:**
- Use a URL do seu projeto Vercel: `https://your-project.vercel.app/api`

### Supabase Auth

O app usa `@supabase/supabase-js` para autenticação. O Supabase gerencia automaticamente:
- Registro de usuários
- Login/logout
- Refresh tokens
- Persistência de sessão (AsyncStorage)

### NFC

O app usa `react-native-nfc-manager` para leitura de tags NFC. Funciona apenas em dispositivos com suporte NFC.

## 📜 Scripts Disponíveis

- `npm start` - Inicia o Metro Bundler
- `npm run android` - Executa no Android
- `npm run ios` - Executa no iOS
- `npm test` - Executa testes
- `npm run lint` - Executa ESLint

## 🔧 Desenvolvimento

### Adicionar Nova Tela

1. Crie o arquivo em `src/screens/`
2. Adicione a rota em `App.tsx`
3. Configure a navegação conforme necessário

### Adicionar Novo Componente

1. Crie o arquivo em `src/components/`
2. Exporte o componente
3. Importe onde necessário

### Integração com API

Todas as chamadas de API devem ser feitas através do `apiClient` em `src/services/api.ts`. O cliente automaticamente:
- Adiciona o token de autenticação
- Gerencia erros
- Formata requisições/respostas

## 🐛 Troubleshooting

### Erro "Unable to resolve module"

```bash
npm start -- --reset-cache
```

### Erro no iOS com CocoaPods

```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Erro de permissões NFC (Android)

Adicione ao `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.NFC" />
```

### Erro de conexão com API (Android Emulator)

Use `10.0.2.2` em vez de `localhost`:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
```

### Erro de autenticação Supabase

1. Verifique se as credenciais estão corretas no `.env`
2. Verifique se o projeto Supabase está ativo
3. Verifique se as políticas RLS estão configuradas corretamente

## 📝 Notas Importantes

- ✅ Supabase Auth está integrado e funcionando
- ✅ AsyncStorage está configurado para persistência
- ✅ NFC Manager está configurado
- ⚠️ Para produção, configure a API Base URL corretamente
- ⚠️ Configure variáveis de ambiente para diferentes ambientes (dev/staging/prod)
- ⚠️ Certifique-se de que as políticas RLS do Supabase estão configuradas

## 🔄 Migração do Firebase para Supabase

Este app foi migrado do Firebase Auth para Supabase Auth. As principais mudanças:

- ✅ Removido `@react-native-firebase/auth`
- ✅ Adicionado `@supabase/supabase-js` e `react-native-url-polyfill`
- ✅ Atualizado `AuthContext` para usar Supabase
- ✅ Mantida compatibilidade com API existente

## 🎯 Próximos Passos

- [ ] Adicionar ícones com `react-native-vector-icons`
- [ ] Implementar WebView para pagamentos
- [ ] Adicionar testes unitários
- [ ] Configurar CI/CD
- [ ] Adicionar analytics
- [ ] Implementar push notifications
- [ ] Otimizar performance
- [ ] Adicionar dark mode

## 📚 Documentação Útil

- [React Native Docs](https://reactnative.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [React Navigation](https://reactnavigation.org/)
- [Vercel Docs](https://vercel.com/docs)

---**Desenvolvido para a stack 2026: Web App + React Native App + Vercel Hobby**