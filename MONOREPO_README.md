# EventOS Platform - Monorepo

## Estrutura

```
/pretossidebar
├── /apps
│   ├── /web          # Next.js web app (Admin/Dashboard)
│   └── /mobile       # React Native/Expo mobile app
├── /packages
│   └── /shared-logic # Código compartilhado (types, services, hooks)
├── /services
│   └── /api          # API routes (Next.js)
└── /supabase         # Migrations e functions
```

## Setup

### 1. Instalar dependências

```bash
npm install
```

Isso instalará dependências para todos os workspaces.

### 2. Configurar variáveis de ambiente

Criar `.env.local` na raiz:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3006
```

### 3. Executar schema do Supabase

Executar `supabase-schema.sql` no SQL Editor do Supabase Dashboard.

### 4. Desenvolvimento

```bash
# Desenvolvimento web
npm run dev:web

# Desenvolvimento mobile
npm run dev:mobile

# Ambos
npm run dev
```

## Workspaces

### `apps/web`
Next.js 14 com App Router. Contém:
- Páginas públicas e privadas
- API routes
- Componentes React
- Hooks específicos do web

### `apps/mobile`
React Native/Expo. Contém:
- Telas mobile
- Navegação
- Hooks específicos do mobile

### `packages/shared-logic`
Código compartilhado entre web e mobile:
- Types TypeScript
- Serviços (split calculator, etc.)
- Hooks compartilhados (useRealtime)
- Cliente Supabase

## Importando código compartilhado

```typescript
// No web ou mobile
import { Event, Booking } from 'shared-logic';
import { calculateSplit } from 'shared-logic';
import { useRealtime } from 'shared-logic';
```

## Build

```bash
npm run build
```

## Estrutura de Dados

Ver `supabase-schema.sql` para todas as tabelas:
- `venues` - Casas de shows
- `events` - Eventos
- `bookings` - Reservas
- `event_staff` - Staff do evento
- `payment_splits` - Splits de pagamento
- `split_payouts` - Pagamentos individuais
- `tickets` - Configuração de bilhetes
- `ticket_sales` - Vendas

## Próximos Passos

1. Completar fluxo de 6 passos (web)
2. Implementar telas mobile
3. Configurar real-time sync
4. Criar cron jobs para processamento automático
5. Testes end-to-end
