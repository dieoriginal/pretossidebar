# 🛒 Lista de Compras - Grocery Budget Manager

**Acesse em:** `seu-site.com/grocery`

---

## 💰 Como Funciona (Millionaire Next Door Style)

### 1. Orçamento Fixo Semanal
- Define um valor fixo (ex: €50/semana)
- A app mostra quanto ainda tens disponível
- Alerta se as compras excederem o orçamento

### 2. Template Semanal Automático
- **Lista padrão** com os mesmos produtos toda semana
- **Reset automático** a cada 7 dias
- Não precisas pensar no que comprar - é sempre o mesmo

### 3. Categorização Automática
- Escreve "pão" → categoriza como "Padaria"
- Escreve "banana" → categoriza como "Hortofrutícolas"
- Sugestões inteligentes enquanto digitas

---

## 📱 Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| 📋 **Lista de Compras** | Itens organizados por categoria com preços |
| 💰 **Orçamento Semanal** | Define budget, vê disponível e gasto |
| 🔄 **Reset Semanal** | Botão "Começar Nova Semana" reseta tudo |
| 📊 **Estatísticas** | Gráficos de gastos por categoria |
| 📥 **Exportar/Importar** | Backup em JSON |
| 🎯 **Auto-categorização** | Produtos são categorizados automaticamente |

---

## 🎯 Como Usar

### Primeira Vez
1. Acede a `/grocery`
2. A tua lista padrão já está carregada
3. Define o teu orçamento semanal (default: €50)

### Semana a Semana
1. Vai à tab **"Template"**
2. Clica em **"🔄 Começar Nova Semana"**
3. Lista reseta para o template padrão
4. Faz as compras e marca como "tenho"

### Adicionar Extras
- Clica em **"➕ Adicionar Extra"**
- Escreve o nome do produto
- Preço e quantidade opcionais

---

## 🏗️ Arquitetura

```
apps/web/src/app/grocery/
├── page.tsx              # Página principal
├── layout.tsx            # Layout com meta tags
├── types/
│   └── index.ts          # Tipos TypeScript
├── lib/
│   ├── storage.ts        # localStorage API
│   ├── autoCategorize.ts # Categorização automática
│   └── templates.ts      # Template semanal
├── hooks/
│   └── useGrocery.ts     # Hook principal
└── components/
    ├── BudgetCard.tsx    # Card de orçamento
    ├── AddItemForm.tsx   # Form adicionar item
    ├── ItemList.tsx      # Lista de items
    ├── Stats.tsx         # Estatísticas
    ├── QuickActions.tsx  # Ações rápidas
    └── TemplateManager.tsx # Gestor de template
```

---

## 🚀 Deploy

A app faz parte do projeto Next.js. Basta fazer deploy normal:

```bash
# Build
npm run build

# Deploy (Vercel)
vercel --prod
```

A app estará disponível em: `https://teu-site.vercel.app/grocery`

---

## 📝 Personalizar Template

Edita `lib/templates.ts` para mudar a tua lista padrão:

```typescript
export const DEFAULT_WEEKLY_TEMPLATE = {
  defaultBudget: 60,  // Muda o orçamento padrão
  items: [
    // Adiciona/remove items do template
    { category: '...', name: '...', unitPrice: 1.50, quantity: 1, status: 'need' },
  ]
};
```

---

## 💡 Princípio: Disciplina = Liberdade

Baseado em "Millionaire Next Door":
- **Orçamento fixo** elimina decisões
- **Lista padrão** elimina pensamento
- **Compras automáticas** = tempo livre para o que importa

---

**Acesso em qualquer lugar, em qualquer cidade!** 📱
