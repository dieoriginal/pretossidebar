# Como Acessar as Novas Funcionalidades

## 🎯 Dashboard de Eventos Principal
**URL:** `http://localhost:3000/events`

### O que verás:
- **Título:** "Events — Painel de Execução"
- **Seletor de Ano:** Topo direito (2026-2029)
- **4 Cards de Estatísticas:**
  - Total Eventos
  - Confirmados (verde)
  - Por Completar (vermelho)
  - Taxa Conclusão (%)
- **3 Tabs:**
  - Todos
  - Confirmados
  - Por Completar
- **Cards de Eventos** com:
  - Status verde/vermelho
  - Barra de progresso
  - Passos críticos
  - Botão "Enviar Email"

---

## 📅 Vista Anual (Calendário)
**URL:** `http://localhost:3000/events/annual`

### O que verás:
- Calendário anual com navegação por anos
- 12 meses em grid
- Cada mês mostra se tem evento ou não
- Clicar num mês abre diálogo para criar/editar evento

---

## 🎤 Página de Evento Individual
**URL:** `http://localhost:3000/events/[id]`

### Passo 0: Visão Geral
**O que encontrarás:**
- **MultiVenueSelector** - Sistema de múltiplas venues
  - Venue Principal (verde)
  - Venues de Backup (amarelo)
  - Filtro por lotação
  - Filtro por cidade
  - Busca de venues

### Passo 1: Financeiro
**O que encontrarás:**
- **ProfitDashboard** - Dashboard de lucro visceral
  - Lucro estimado (grande número no topo)
  - Receitas: Bilhetes, Patrocínios, Merch
  - Custos detalhados com barras de progresso
  - Break-even point
  - 3 Cenários: Otimista, Realista, Pessimista

---

## 🔧 Funcionalidades Implementadas

### 1. Sistema Quinzenal
- **24 shows por ano** (2 por mês)
- Templates gerados automaticamente para 2026-2029
- Cada show tem semana (1ª ou 2ª quinzena)

### 2. Rotação de Cidades
- Lisboa e Porto alternam na 1ª quinzena
- Outras cidades na 2ª quinzena
- Sistema de backup por cidade

### 3. Múltiplas Venues
- Venue principal + backups
- Filtro automático por lotação
- Filtro por cidade
- Reconhecimento técnico de lotação

### 4. Dashboard de Lucro
- Cálculo automático baseado em:
  - Lotação
  - Preço bilhetes
  - Taxa ocupação
  - Patrocínios
  - Merch
  - Todos os custos
- 3 cenários de análise
- Break-even point
- ROI e margem

---

## 🐛 Se não vês as mudanças:

1. **Limpa o IndexedDB:**
   - Abre DevTools (F12)
   - Application > IndexedDB
   - Apaga "FazteUmAmboDB"
   - Recarrega a página

2. **Reinicia o servidor:**
   ```bash
   # Para o servidor (Ctrl+C)
   npm run dev
   ```

3. **Verifica o console:**
   - F12 > Console
   - Procura por erros

4. **Templates:**
   - Os templates são criados automaticamente na primeira visita
   - Se não aparecerem, limpa o IndexedDB e recarrega

---

## 📍 Localização dos Componentes

- **ProfitDashboard:** `/pretossidebar/src/components/events/ProfitDashboard.tsx`
- **MultiVenueSelector:** `/pretossidebar/src/components/events/MultiVenueSelector.tsx`
- **EventCompletionCard:** `/pretossidebar/src/components/events/EventCompletionCard.tsx`
- **EventStatusBadge:** `/pretossidebar/src/components/events/EventStatusBadge.tsx`
- **Profit Calculator:** `/pretossidebar/src/lib/profit-calculator.ts`
- **Event Templates:** `/pretossidebar/src/lib/event-templates.ts`
- **Completion Tracker:** `/pretossidebar/src/lib/event-completion-tracker.ts`

---

## ✅ Checklist de Teste

- [ ] Aceder a `/events` e ver o novo dashboard
- [ ] Ver seletor de ano (2026-2029)
- [ ] Ver 4 cards de estatísticas
- [ ] Ver tabs (Todos/Confirmados/Por Completar)
- [ ] Aceder a um evento individual
- [ ] No Overview, ver MultiVenueSelector
- [ ] No Financeiro, ver ProfitDashboard
- [ ] Verificar que templates foram criados (24 por ano)




