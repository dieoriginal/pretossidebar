# Expo Go Setup - PRETOS MUSIC

Guia completo para usar o app com Expo Go.

## 🚀 Setup Rápido

### 1. Instalar Expo CLI (globalmente, opcional)

```bash
npm install -g expo-cli
```

Ou use `npx` (recomendado):
```bash
npx expo start
```

### 2. Instalar Dependências

```bash
cd mobile-app
npm install
```

### 3. Iniciar o App

```bash
npm start
# ou
npx expo start
```

Isso abrirá o Expo Dev Tools no navegador.

### 4. Escanear QR Code

**iOS:**
- Abra a app **Expo Go** na App Store
- Escaneie o QR code com a câmera do iPhone
- Ou use o scanner dentro do Expo Go

**Android:**
- Abra a app **Expo Go** na Play Store
- Escaneie o QR code com o Expo Go app
- Ou use o comando `a` no terminal para abrir no Android emulador

## 📱 Comandos Úteis

```bash
# Iniciar Expo
npm start

# Abrir no Android emulador
npm start --android
# ou pressione 'a' no terminal

# Abrir no iOS simulator
npm start --ios
# ou pressione 'i' no terminal

# Limpar cache
npm start -- --clear

# Modo tunnel (para testar em dispositivos na mesma rede)
npm start --tunnel
```

## ⚙️ Configuração de Variáveis de Ambiente

Com Expo, você pode usar variáveis de ambiente facilmente:

Crie um arquivo `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key
EXPO_PUBLIC_API_URL=https://your-project.vercel.app/api
```

As variáveis `EXPO_PUBLIC_*` são automaticamente disponíveis no código.

Para usar no código:
```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
```

## ⚠️ Limitações do Expo Go

### NFC Manager
**⚠️ IMPORTANTE:** `react-native-nfc-manager` **NÃO funciona** no Expo Go.

O NFC Manager requer código nativo customizado que não está disponível no Expo Go. Para usar NFC, você precisará:

1. **Opção 1: Development Build** (Recomendado)
   - Criar um development build com EAS Build
   - Instalar no dispositivo via TestFlight (iOS) ou APK (Android)
   - NFC funcionará normalmente

2. **Opção 2: Expo Dev Client**
   - Criar um custom dev client
   - Usar expo-dev-client em vez de Expo Go

3. **Opção 3: Desabilitar NFC temporariamente**
   - Comentar código relacionado a NFC
   - Desenvolver outras funcionalidades
   - Adicionar NFC depois com development build

### NativeWind / Tailwind
NativeWind pode ter limitações no Expo Go. Recomendamos usar StyleSheet do React Native diretamente (já implementado).

## 🔄 Migração de React Native CLI para Expo

Se você estava usando React Native CLI antes:

### Removido
- ❌ Pastas `android/` e `ios/` (Expo gerencia isso)
- ❌ Scripts `react-native run-android` / `run-ios`
- ❌ CocoaPods para iOS
- ❌ Gradle para Android

### Mantido
- ✅ Todo o código fonte em `src/`
- ✅ Componentes e screens
- ✅ Lógica de negócio
- ✅ Configurações (Supabase, API, etc)

### Novo
- ✅ `app.json` - Configuração do Expo
- ✅ Scripts Expo (`expo start`, etc)
- ✅ Expo Go para desenvolvimento rápido

## 📦 Dependências Atualizadas

Todas as dependências foram atualizadas para versões compatíveis com Expo SDK 51:

- ✅ `expo` ~51.0.0
- ✅ `react-native` 0.74.5
- ✅ `@react-navigation/*` - Compatível
- ✅ `@supabase/supabase-js` - Compatível
- ✅ `react-native-safe-area-context` - Versão Expo
- ✅ `@react-native-async-storage/async-storage` - Versão Expo

## 🐛 Troubleshooting

### Erro "Unable to resolve module"

```bash
npm start -- --clear
rm -rf node_modules
npm install
```

### App não carrega no Expo Go

1. Verifique se está na mesma rede WiFi (ou use tunnel)
2. Certifique-se de que o Metro bundler está rodando
3. Tente `expo start --clear`

### Erro de variáveis de ambiente

Certifique-se de que as variáveis começam com `EXPO_PUBLIC_*` para serem acessíveis no cliente.

### NFC não funciona

Como esperado - NFC não funciona no Expo Go. Use Development Build ou desabilite temporariamente.

## 🎯 Próximos Passos

1. ✅ Testar app no Expo Go
2. ⏳ Configurar variáveis de ambiente
3. ⏳ Testar autenticação Supabase
4. ⏳ Testar navegação e screens
5. ⏳ Se precisar de NFC: criar Development Build

## 📚 Recursos

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Go App](https://expo.dev/client)
- [EAS Build](https://docs.expo.dev/build/introduction/) (para Development Build)
- [Expo Dev Client](https://docs.expo.dev/development/introduction/) (alternativa ao Expo Go)

---

**Desenvolvido para Expo Go** 🚀
