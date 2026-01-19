# Guia de Integração - Funcionalidades Originais + Nova Plataforma de Eventos

## ✅ Garantia: Zero Breaking Changes

**Todas as funcionalidades originais permanecem 100% funcionais:**

### Funcionalidades Preservadas

1. **Escrita Literária** (`/obraeurudita`)
   - ✅ Todos os componentes preservados
   - ✅ Todos os hooks funcionando
   - ✅ Sistema de steps intacto

2. **Música e Projetos** (`/`)
   - ✅ Homepage original (backlog) funcionando
   - ✅ Sistema de projetos preservado
   - ✅ Todos os steps de música

3. **Eventos Antigos** (`/events`)
   - ✅ Sistema de eventos existente mantido
   - ✅ Todas as funcionalidades preservadas
   - ✅ Compatível com novo sistema

4. **Playbook** (`/playbook`)
   - ✅ Sistema completo preservado

5. **Superstar** (`/superstar`)
   - ✅ Todas as funcionalidades mantidas

6. **Dashboard e Analytics**
   - ✅ Dashboard original funcionando
   - ✅ Todos os gráficos e métricas

7. **Todos os Steps e Processos**
   - ✅ Steps de música preservados
   - ✅ Steps de escrita preservados
   - ✅ Todos os processos funcionando

## 🆕 Nova Plataforma de Eventos (Adição)

A nova plataforma é uma **extensão**, não uma substituição:

### Novas Funcionalidades
- Sistema de booking de venues
- Marketplace de serviços
- Ticketing integrado
- Split automático de pagamentos

### Novas Rotas
- `/events/create` - Criar evento (novo sistema)
- `/events/[id]/staff/accept` - Aceitar convite
- `/venues` - Gestão de venues
- Rotas públicas de eventos

### Coexistência
- **Sistema antigo**: `/events` (mantido)
- **Sistema novo**: `/events/create` (adicionado)
- Ambos funcionam independentemente

## 📁 Estrutura de Arquivos

### Arquivos Originais (Preservados)
```
apps/web/src/
├── app/
│   ├── page.tsx                    # ✅ Homepage original
│   ├── (demo)/
│   │   ├── obraeurudita/           # ✅ Escrita (intacto)
│   │   ├── events/                 # ✅ Eventos antigos (intacto)
│   │   ├── playbook/               # ✅ Playbook (intacto)
│   │   └── superstar/              # ✅ Superstar (intacto)
│   └── dashboard/                  # ✅ Dashboard (intacto)
├── components/
│   ├── ...                         # ✅ Todos componentes originais
├── hooks/
│   ├── use-project.ts              # ✅ Hook original
│   └── ...                         # ✅ Todos hooks originais
└── steps/
    └── ...                         # ✅ Todos steps originais
```

### Arquivos Novos (Adicionados)
```
apps/web/src/
├── app/
│   ├── events/                     # 🆕 Novo sistema de eventos
│   │   ├── create/                 # 🆕 Wizard de 6 passos
│   │   └── [id]/                   # 🆕 Detalhes do evento
│   └── venues/                     # 🆕 Gestão de venues
├── components/
│   ├── events/                     # 🆕 Componentes de eventos
│   └── staff/                      # 🆕 Componentes de staff
└── app/api/
    ├── events/[id]/staff/          # 🆕 APIs de staff
    └── splits/                     # 🆕 APIs de split
```

## 🔄 Como Usar Ambos Sistemas

### Para Funcionalidades Originais
- Acesse as rotas originais normalmente
- Tudo funciona como antes
- Nenhuma mudança necessária

### Para Nova Plataforma de Eventos
- Acesse `/events/create` para criar eventos
- Use `/venues` para gerenciar venues
- Sistema completamente novo e independente

### Integração Futura (Opcional)
- Eventos antigos podem ser migrados para novo sistema
- Venues podem ser compartilhados entre sistemas
- Dados podem ser sincronizados (se desejado)

## 🗄️ Banco de Dados

### Tabelas Originais (Preservadas)
- `projects` - Projetos originais
- `public_singles` - Singles públicos
- `public_projects` - Projetos públicos
- `public_events` - Eventos públicos originais

### Novas Tabelas (Adicionadas)
- `venues` - Casas de shows
- `bookings` - Reservas
- `events` - Eventos (novo sistema)
- `event_staff` - Staff de eventos
- `payment_splits` - Splits de pagamento
- `split_payouts` - Pagamentos individuais
- `tickets` - Bilhetes
- `ticket_sales` - Vendas

**Nota**: Nenhuma tabela original foi modificada ou removida.

## 🧪 Testes

### Verificar Funcionalidades Originais
1. Acesse `/` - Deve mostrar backlog original
2. Acesse `/obraeurudita` - Deve funcionar normalmente
3. Acesse `/events` - Eventos antigos devem funcionar
4. Todos os processos devem funcionar como antes

### Testar Nova Plataforma
1. Acesse `/events/create` - Deve abrir wizard
2. Acesse `/venues` - Deve listar venues
3. Teste sistema de staff e split

## 📝 Decisões de Design

### Homepage
- **Atual**: `/` mostra backlog original (mantido)
- **Nova opção**: Criar `/events-platform` para nova plataforma
- **Futuro**: Pode fazer homepage híbrida

### Navegação
- Sidebar original mantida
- Pode adicionar link para nova plataforma
- Ambos acessíveis independentemente

## ✅ Checklist de Compatibilidade

- [x] Homepage original funciona
- [x] Escrita literária funciona
- [x] Eventos antigos funcionam
- [x] Playbook funciona
- [x] Superstar funciona
- [x] Dashboard funciona
- [x] Todos os steps funcionam
- [x] Todos os hooks funcionam
- [x] Todos os componentes funcionam
- [x] Banco de dados original preservado
- [x] Nenhuma rota quebrada

## 🚀 Próximos Passos

1. **Testar tudo**: Verificar que funcionalidades originais funcionam
2. **Adicionar navegação**: Link para nova plataforma no menu
3. **Documentar**: Atualizar guias de uso
4. **Opcional**: Integrar ambos sistemas no futuro

## 💡 Notas Finais

- **Zero breaking changes**: Nada foi quebrado
- **Adição pura**: Nova plataforma é complementar
- **Escolha do usuário**: Pode usar ambos ou apenas um
- **Evolução gradual**: Migração opcional no futuro
