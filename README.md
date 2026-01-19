# EventOS Platform - Sistema Completo de Gestão de Eventos

Plataforma completa para criação, gestão e monetização de eventos. **Adiciona** sistema de booking de venues, marketplace de serviços, ticketing integrado e split automático de pagamentos ao sistema existente.

## 🎯 Visão Geral

EventOS é uma **extensão** da plataforma Pretos Music que adiciona:
- **Reservar venues** com calendário interativo
- **Contratar serviços** (iluminação, som, DJs, etc.)
- **Vender bilhetes** com QR codes
- **Dividir receitas automaticamente** com staff

Tudo em **6 passos simples**.

## ⚠️ Importante: Funcionalidades Originais Preservadas

**Todas as funcionalidades originais permanecem intactas:**
- ✅ Música e Videoclipe
- ✅ Escrita Literária (`/obraeurudita`)
- ✅ Playbook
- ✅ Superstar
- ✅ Eventos Antigos (`/events`)
- ✅ Projetos e Dashboard
- ✅ Todos os steps e processos

A nova plataforma de eventos é uma **adição**, não uma substituição.

## 🏗️ Arquitetura

### Monorepo Structure

```
/pretossidebar
├── /apps
│   ├── /web          # Next.js 14 (mantém tudo + novos eventos)
│   └── /mobile       # React Native/Expo
├── /packages
│   └── /shared-logic # Código compartilhado
└── /supabase         # Migrations e functions
```

### Stack Tecnológico

- **Backend**: Supabase (PostgreSQL + Realtime + Storage)
- **Auth**: Clerk (unificado web + mobile)
- **Payments**: Stripe (Connect para splits)
- **Web**: Next.js 14, React, TypeScript
- **Mobile**: React Native, Expo
- **Real-time**: Supabase Realtime (WebSockets)

## 🚀 Quick Start

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Criar `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
STRIPE_SECRET_KEY=your_stripe_secret
NEXT_PUBLIC_APP_URL=http://localhost:3006
```

### 3. Executar Schema do Supabase

Executar `supabase-schema.sql` no SQL Editor do Supabase Dashboard.

**Nota**: O schema adiciona novas tabelas sem modificar as existentes.

### 4. Desenvolvimento

```bash
# Web app (inclui funcionalidades originais + novas)
npm run dev:web

# Mobile app
npm run dev:mobile

# Ambos
npm run dev
```

## 📋 Funcionalidades

### Sistema Original (Mantido)
- Gestão de projetos musicais
- Escrita literária
- Playbooks
- Eventos (sistema antigo)
- Dashboard e analytics
- Todos os processos existentes

### Nova Plataforma de Eventos (Adicionada)

#### Sistema de Booking
- Calendário de disponibilidade de venues
- Preços dinâmicos por data
- Aprovação automática ou manual
- Pagamento via Stripe

#### Marketplace de Serviços
- Busca de prestadores (iluminação, som, DJs, etc.)
- Contratação integrada
- Gestão de pagamentos

#### Sistema de Ticketing
- Múltiplos tiers (Early Bird, Regular, VIP)
- QR codes para validação
- Venda direta integrada
- Analytics em tempo real

#### Split Automático de Pagamentos
- Convites de staff via link
- Setup de conta bancária
- Cálculo automático (porcentagem ou valor fixo)
- Processamento via Stripe Connect
- Pagamentos automáticos após evento

## 📚 Documentação

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura completa e integração
- [MONOREPO_README.md](./MONOREPO_README.md) - Guia do monorepo
- [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md) - Progresso da implementação
- [supabase-schema.sql](./supabase-schema.sql) - Schema completo do banco

## 🔧 Desenvolvimento

### Estrutura de Workspaces

- `apps/web` - Aplicação web Next.js (tudo incluído)
- `apps/mobile` - Aplicação mobile React Native
- `packages/shared-logic` - Lógica compartilhada

### Importar Código Compartilhado

```typescript
import { Event, Booking, EventStaff } from 'shared-logic';
import { calculateSplit } from 'shared-logic';
import { useRealtime } from 'shared-logic';
```

## 🗺️ Rotas

### Rotas Originais (Funcionando)
- `/` - Homepage original (backlog)
- `/obraeurudita` - Escrita literária
- `/events` - Eventos antigos
- `/playbook` - Playbooks
- `/dashboard` - Dashboard
- Todas as outras rotas existentes

### Novas Rotas (Adicionadas)
- `/events/create` - Criar evento (wizard)
- `/events/[id]/staff/accept` - Aceitar convite
- `/venues` - Lista de venues
- Rotas públicas de eventos

## 📝 Status da Implementação

Ver [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md) para detalhes.

### ✅ Completado
- Estrutura monorepo
- Schema Supabase (adiciona sem quebrar)
- Tipos TypeScript compartilhados
- APIs de staff e split
- Componentes básicos
- **Todas funcionalidades originais preservadas**

### 🚧 Em Progresso
- Fluxo de 6 passos completo
- Telas mobile
- Real-time sync
- Automação de splits

## 📄 Licença

Copyright © 2025 Pretos Music Software
