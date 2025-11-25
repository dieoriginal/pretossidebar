# Arquitetura do Sistema - PRETOS MUSIC

## Visão Geral

Sistema modular e escalável para gestão de processos criativos e de negócio na indústria musical. Arquitetura baseada em **Factory Pattern**, **Configuration-Driven Development** e **Module Connector Pattern**.

## Princípios de Design

1. **Modularidade**: Cada processo é um módulo independente
2. **Configuração Centralizada**: Todos os processos definidos em `processes-config.ts`
3. **Factory Pattern**: Criação dinâmica de instâncias de processos
4. **Conexão entre Módulos**: Sistema de sincronização de dados entre processos
5. **Extensibilidade**: Fácil adicionar novos processos sem modificar código existente

## Estrutura de Arquivos

```
src/
├── lib/
│   ├── processes-config.ts      # Configuração central de todos os processos
│   ├── process-factory.ts       # Factory para criar/gerir instâncias
│   └── module-connector.ts      # Sistema de conexão entre módulos
├── hooks/
│   ├── use-process-manager.ts   # Hook unificado para gerir processos
│   ├── use-project.ts           # Hook específico para projetos de música
│   └── use-events.ts            # Hook específico para eventos
├── components/
│   └── process-manager/         # Componentes para gestão de processos
└── app/
    └── (demo)/                   # Páginas dos processos
```

## Como Adicionar um Novo Processo

### 1. Adicionar Configuração

Em `src/lib/processes-config.ts`:

```typescript
{
  id: "meu-processo",
  type: "custom",
  label: "Meu Processo",
  href: "/meu-processo",
  section: "Processo X",
  icon: MeuIcon,
  description: "Descrição do processo",
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
  metadata: {
    color: "blue",
    category: "criação",
    tags: ["tag1", "tag2"],
  },
}
```

### 2. Criar Página

Criar `src/app/(demo)/meu-processo/[id]/page.tsx`:

```typescript
"use client";

import { useProcessManager } from "@/hooks/use-process-manager";
import { processFactory } from "@/lib/process-factory";

export default function MeuProcessoPage({ params }: { params: { id: string } }) {
  const { loadInstances, saveInstance } = useProcessManager();
  // ... implementação
}
```

### 3. (Opcional) Criar Hook Específico

Se necessário, criar hook em `src/hooks/use-meu-processo.ts`:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { saveToIndexedDB, loadFromIndexedDB } from "@/lib/meu-processo-db";

export const useMeuProcesso = create(
  persist(
    (set, get) => ({
      // ... estado
    }),
    { name: "meuProcessoAtual" }
  )
);
```

## Sistema de Conexão entre Módulos

### Registrar Conexão

```typescript
import { moduleConnector } from "@/lib/module-connector";

moduleConnector.registerConnection({
  sourceProcessId: "music",
  targetProcessId: "event",
  connectionType: "data",
  mapping: {
    "songInfo.title": "overview.eventName",
  },
});
```

### Sincronizar Dados

```typescript
const syncedInstance = await moduleConnector.syncData(
  sourceInstanceId,
  targetProcessId
);
```

## Factory Pattern

### Criar Instância

```typescript
import { processFactory } from "@/lib/process-factory";

const instance = await processFactory.create("event", {
  overview: { eventName: "Meu Evento" }
});
```

### Listar Instâncias

```typescript
const instances = await processFactory.list("event");
```

### Duplicar Instância

```typescript
const duplicated = await processFactory.duplicate(instanceId);
```

## Process Manager Hook

Hook unificado para gerir todos os processos:

```typescript
import { useProcessManager } from "@/hooks/use-process-manager";

function MyComponent() {
  const {
    processes,
    instances,
    createInstance,
    deleteInstance,
    duplicateInstance,
    getInstancesByProcess,
  } = useProcessManager();

  // Usar...
}
```

## Componente ProcessManager

Componente React para exibir e gerir processos:

```typescript
import { ProcessManager } from "@/components/process-manager/ProcessManager";

<ProcessManager 
  filterByCategory="criação"
  showCreateButton={true}
  viewMode="grid"
/>
```

## Persistência

Todos os processos usam IndexedDB para persistência local:

- **projects**: Projetos de música
- **events**: Eventos/Concertos
- **processInstances**: Instâncias gerais de processos
- Outros stores específicos por processo

## Extensibilidade

### Adicionar Features

1. Adicionar feature flag em `ProcessConfig.features`
2. Implementar lógica na página do processo
3. Usar `processFactory` para persistência

### Adicionar Templates

1. Criar template em `src/lib/templates/`
2. Adicionar referência em `ProcessConfig`
3. Usar no componente do processo

## Boas Práticas

1. **Sempre usar `processFactory`** para criar/gerir instâncias
2. **Usar `useProcessManager`** para acesso unificado
3. **Configurar conexões** entre processos relacionados
4. **Manter configuração centralizada** em `processes-config.ts`
5. **Documentar novos processos** no README

## Roadmap

- [ ] Sistema de plugins/extensões
- [ ] Sincronização em tempo real entre abas
- [ ] Exportação/importação de configurações
- [ ] Sistema de templates avançado
- [ ] Analytics e métricas por processo
- [ ] API REST para processos
- [ ] Sincronização cloud (opcional)

