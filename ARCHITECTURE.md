# Arquitetura do Sistema - EventOS Platform

## Visão Geral

O sistema mantém **todas as funcionalidades originais** (escrita, música, projetos, etc.) e adiciona uma **nova plataforma de eventos** como funcionalidade adicional.

## Estrutura de Funcionalidades

### Funcionalidades Originais (Mantidas)
- ✅ **Música e Videoclipe** - Criação e produção musical
- ✅ **Escrita Literária** - Criação literária (`/obraeurudita`)
- ✅ **Playbook** - Gestão de playbooks
- ✅ **Superstar** - Gestão de superstar
- ✅ **Eventos Antigos** - Sistema de eventos existente (`/events`)
- ✅ **Projetos** - Sistema de projetos (`/dashboard`)
- ✅ **Merchandise** - Gestão de produtos
- ✅ **Todos os steps e processos existentes**

### Nova Plataforma de Eventos (Adicionada)
- 🆕 **Sistema de Booking** - Reserva de venues
- 🆕 **Marketplace de Serviços** - Contratação de serviços
- 🆕 **Ticketing Integrado** - Venda de bilhetes
- 🆕 **Split Automático** - Divisão de receitas

## Rotas e Navegação

### Rotas Existentes (Mantidas)
- `/` - Homepage original (backlog de projetos)
- `/obraeurudita` - Escrita literária
- `/events` - Eventos antigos
- `/playbook` - Playbooks
- `/superstar` - Superstar
- `/dashboard` - Dashboard de projetos
- Todas as outras rotas existentes

### Novas Rotas (Adicionadas)
- `/events/create` - Criar novo evento (wizard de 6 passos)
- `/events/[id]/staff/accept` - Aceitar convite de staff
- `/venues` - Lista de venues
- `/venues/[id]` - Página de venue
- Rotas públicas de eventos

## Integração

### Como Funciona
1. **Sistema Original**: Continua funcionando normalmente
2. **Nova Plataforma**: Adicionada como módulo adicional
3. **Compartilhamento**: Ambos usam o mesmo:
   - Banco de dados Supabase
   - Autenticação Clerk
   - Código compartilhado (`packages/shared-logic`)

### Dados Compartilhados
- **Usuários**: Mesmo sistema de autenticação
- **Venues**: Podem ser usados em ambos os sistemas
- **Eventos**: Sistema antigo e novo coexistem
- **Projetos**: Sistema original mantido

## Estrutura de Arquivos

```
apps/web/src/
├── app/
│   ├── page.tsx              # Homepage original (BACKLOG)
│   ├── page-new.tsx          # Nova homepage de eventos (opcional)
│   ├── (demo)/
│   │   ├── obraeurudita/     # Escrita (mantido)
│   │   ├── events/           # Eventos antigos (mantido)
│   │   ├── playbook/         # Playbook (mantido)
│   │   └── ...               # Todas funcionalidades originais
│   ├── events/               # NOVO - Sistema de eventos
│   │   ├── create/           # Wizard de 6 passos
│   │   └── [id]/             # Detalhes do evento
│   └── venues/               # NOVO - Gestão de venues
├── components/
│   ├── ...                   # Componentes originais (mantidos)
│   ├── events/               # NOVO - Componentes de eventos
│   └── staff/                # NOVO - Componentes de staff
├── hooks/
│   ├── use-project.ts        # Hook original (mantido)
│   └── ...                   # Todos hooks originais
└── steps/
    └── ...                   # Todos os steps originais (mantidos)
```

## Decisões de Design

### Homepage
- **Opção 1**: Manter `page.tsx` original como homepage principal
- **Opção 2**: Criar rota `/events-platform` para nova plataforma
- **Opção 3**: Fazer homepage híbrida (mostrar ambos)

### Navegação
- Sidebar original mantida
- Nova navegação para eventos pode ser adicionada
- Ambos sistemas acessíveis

## Migração e Compatibilidade

### Zero Breaking Changes
- ✅ Nenhuma funcionalidade original foi removida
- ✅ Todas as rotas antigas funcionam
- ✅ Todos os componentes originais preservados
- ✅ Banco de dados expandido (não substituído)

### Adições
- ✅ Novas tabelas no Supabase
- ✅ Novas APIs
- ✅ Novos componentes
- ✅ Novo fluxo de eventos

## Próximos Passos

1. **Decidir homepage**: Manter original ou criar híbrida
2. **Navegação**: Adicionar link para nova plataforma no menu
3. **Integração**: Conectar eventos antigos com novo sistema (opcional)
4. **Documentação**: Atualizar guias de uso

## Notas Importantes

- **Tudo funciona**: Sistema original 100% funcional
- **Adição, não substituição**: Nova plataforma é complementar
- **Escolha do usuário**: Pode usar ambos sistemas
- **Evolução gradual**: Migração opcional no futuro
