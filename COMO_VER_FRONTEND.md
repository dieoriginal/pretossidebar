# Como Ver o Frontend

## Iniciar o Servidor de Desenvolvimento

Para ver a aplicação no navegador, execute:

```bash
npm run dev
```

Isso irá:
1. Iniciar o servidor Next.js na porta **3000** (ou 3001 se 3000 estiver ocupada)
2. Iniciar o servidor Python Flask na porta **5001**

## Acessar a Aplicação

Abra o navegador e acesse:

- **Frontend:** http://localhost:3000 ou http://localhost:3001
- **API Python:** http://localhost:5001

## Comandos Disponíveis

- `npm run dev` - Inicia desenvolvimento (web + Python)
- `npm run dev:web` - Apenas servidor Next.js
- `npm run dev:py` - Apenas servidor Python Flask
- `npm run build` - Build de produção
- `npm run start` - Inicia servidor de produção

## Notas

- O servidor Next.js usa hot-reload (mudanças aparecem automaticamente)
- Se a porta 3000 estiver ocupada, Next.js tentará 3001 automaticamente
- O servidor Python Flask usa a porta 5001 (para evitar conflito com AirPlay no macOS)



