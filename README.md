# PRETOS MUSIC - Sistema de Gestão Criativa

Sistema modular e escalável para gestão completa de processos na indústria musical.

## 🚀 Funcionalidades Principais

### Processos Disponíveis

1. **Música e Videoclipe** - Criação e produção musical
2. **Concerto** - Planeamento completo de eventos
3. **Merchandise** - Gestão de produtos
4. **Mini-Digressão** - Planeamento de tours
5. **Patrocínios & Apoios** - Gestão de financiamento
6. **Sync Licensing** - Licenciamento
7. **Serviços de Audiovisual** - Produção audiovisual
8. **Academia** - Conteúdos educacionais
9. **Escrita Literária** - Criação literária
10. **Beatstore** - Venda de beats

### Características

- ✅ **Persistência Automática** - Todos os dados são salvos automaticamente
- ✅ **Sistema Modular** - Fácil adicionar novos processos
- ✅ **Conexão entre Módulos** - Sincronização de dados entre processos
- ✅ **Exportação PDF** - Exportar qualquer processo em PDF
- ✅ **Templates** - Modelos pré-configurados
- ✅ **Multi-projeto** - Gerir múltiplos projetos simultaneamente

## 📁 Estrutura do Projeto

```
pretossidebar/
├── src/
│   ├── app/                    # Páginas Next.js
│   │   ├── (demo)/            # Processos principais
│   │   │   ├── events/        # Sistema de eventos
│   │   │   ├── obraeurudita/  # Música e videoclipe
│   │   │   └── ...
│   │   └── page.tsx           # Dashboard principal
│   ├── components/            # Componentes React
│   │   ├── admin-panel/       # Painel administrativo
│   │   └── process-manager/   # Gestor de processos
│   ├── hooks/                 # React Hooks
│   │   ├── use-process-manager.ts
│   │   ├── use-project.ts
│   │   └── use-events.ts
│   ├── lib/                   # Bibliotecas e utilitários
│   │   ├── processes-config.ts    # Configuração central
│   │   ├── process-factory.ts     # Factory pattern
│   │   ├── module-connector.ts    # Conexão entre módulos
│   │   ├── events-db.ts            # Database de eventos
│   │   └── db.ts                   # Database geral
│   └── components/ui/         # Componentes UI (shadcn/ui)
└── ARCHITECTURE.md            # Documentação de arquitetura
```

## 🛠️ Como Adicionar um Novo Processo

### 1. Configurar o Processo

Editar `src/lib/processes-config.ts`:

```typescript
{
  id: "meu-novo-processo",
  type: "custom",
  label: "Meu Novo Processo",
  href: "/meu-processo",
  section: "Processo X",
  icon: MeuIcon,
  description: "Descrição",
  enabled: true,
  order: 13,
  dbStore: "meuProcesso",
  features: {
    save: true,
    export: true,
    share: true,
    templates: true,
    analytics: true,
  },
}
```

### 2. Criar a Página

Criar `src/app/(demo)/meu-processo/[id]/page.tsx`:

```typescript
"use client";

import { useProcessManager } from "@/hooks/use-process-manager";
import { processFactory } from "@/lib/process-factory";
import { useEffect, useState } from "react";

export default function MeuProcessoPage({ params }: { params: { id: string } }) {
  const { saveInstance } = useProcessManager();
  const [data, setData] = useState<any>({});

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    const instance = await processFactory.load(params.id);
    if (instance) {
      setData(instance.data);
    }
  };

  const handleSave = async () => {
    const instance = await processFactory.load(params.id);
    if (instance) {
      instance.data = data;
      await saveInstance(instance);
    }
  };

  return (
    <div>
      {/* Seu conteúdo aqui */}
    </div>
  );
}
```

### 3. (Opcional) Criar Hook Específico

Se precisar de lógica específica, criar `src/hooks/use-meu-processo.ts`.

## 🔗 Sistema de Conexão entre Módulos

Conecta dados entre processos diferentes:

```typescript
import { moduleConnector } from "@/lib/module-connector";

// Sincronizar dados de música para evento
const eventInstance = await moduleConnector.syncData(
  musicInstanceId,
  "event"
);
```

## 📊 Persistência

- **IndexedDB**: Armazenamento local persistente
- **localStorage**: Cache rápido
- **Auto-save**: Salva automaticamente após 2 segundos de inatividade

## 🎨 Componentes Principais

### ProcessManager

Componente para exibir e gerir todos os processos:

```typescript
import { ProcessManager } from "@/components/process-manager/ProcessManager";

<ProcessManager 
  filterByCategory="criação"
  viewMode="grid"
/>
```

### useProcessManager

Hook unificado para gerir processos:

```typescript
const {
  processes,
  instances,
  createInstance,
  deleteInstance,
  duplicateInstance,
} = useProcessManager();
```

## 📚 Documentação

- **ARCHITECTURE.md**: Documentação completa da arquitetura
- **processes-config.ts**: Configuração de todos os processos
- Código comentado em português

## 🚀 Desenvolvimento

   ```bash
# Instalar dependências
npm install

# Desenvolvimento
  npm run dev

# Build
npm run build
```

## 🎯 Próximos Passos

- [ ] Sistema de plugins
- [ ] Sincronização cloud
- [ ] API REST
- [ ] Analytics avançado
- [ ] Templates dinâmicos

## 📝 Notas

Sistema construído com:
- Next.js 14
- React 18
- TypeScript
- Zustand (state management)
- IndexedDB (persistência)
- Tailwind CSS
- shadcn/ui

---

**Desenvolvido com filosofia de modularidade e extensibilidade.**
