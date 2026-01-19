# Configuração do Supabase

Este guia explica como configurar o Supabase para substituir o Firebase no projeto.

## 1. Criar Projeto no Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Preencha os dados do projeto:
   - Nome do projeto
   - Senha do banco de dados
   - Região (escolha a mais próxima)
5. Aguarde a criação do projeto (pode levar alguns minutos)

## 2. Obter Credenciais

1. No dashboard do Supabase, vá em **Settings** → **API**
   2. Copie os seguintes valores:
      - **Project URL** → NEXT_PUBLIC_SUPABASE_URL="https://egptetkpgbukocczwtlk.supabase.co"
      - **anon public** key → NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVncHRldGtwZ2J1a29jY3p3dGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1Mjg0OTcsImV4cCI6MjA4MTEwNDQ5N30.jje-IJ7E2bi2ZxmSUa25ocBeJMyer8ZkJcI3VWNfbYE"
      - **service_role** key → SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVncHRldGtwZ2J1a29jY3p3dGxrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUyODQ5NywiZXhwIjoyMDgxMTA0NDk3fQ.j_sQPm1JMkjndUSu0AKJyX0TXdJOSSIskzDS_BC5VS0"

## 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Criar Tabelas no Supabase

1. No dashboard do Supabase, vá em **SQL Editor**
2. Abra o arquivo `supabase-schema.sql` na raiz do projeto
3. Copie e cole todo o conteúdo no SQL Editor
4. Clique em **Run** para executar o script
5. Verifique se as tabelas foram criadas em **Table Editor**

## 5. Configurar Row Level Security (RLS)

O script SQL já inclui as políticas RLS, mas você pode verificar em **Authentication** → **Policies**.

As políticas configuradas são:
- **projects**: Usuários só podem acessar seus próprios projetos
- **public_singles**: Leitura pública, escrita autenticada
- **public_projects**: Leitura pública (apenas is_public=true), escrita autenticada
- **public_events**: Leitura pública (apenas is_public=true), escrita autenticada

## 6. (Opcional) Migrar Dados do Firebase

Se você tem dados existentes no Firebase que deseja migrar:

1. Configure as variáveis de ambiente do Firebase Admin:
   ```env
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

2. Execute o script de migração:
   ```bash
   npx tsx scripts/migrate-firebase-to-supabase.ts
   ```

## 7. Testar a Integração

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Teste as funcionalidades:
   - Criar um novo projeto
   - Salvar projeto (deve sincronizar com Supabase)
   - Carregar projetos salvos
   - Publicar single público
   - Buscar singles públicos

## Troubleshooting

### Erro: "Supabase URL ou Anon Key não configurados"
- Verifique se as variáveis de ambiente estão configuradas corretamente
- Certifique-se de que o arquivo `.env.local` está na raiz do projeto
- Reinicie o servidor de desenvolvimento após adicionar variáveis

### Erro: "relation does not exist"
- Execute o script SQL (`supabase-schema.sql`) no SQL Editor do Supabase
- Verifique se todas as tabelas foram criadas em **Table Editor**

### Erro: "new row violates row-level security policy"
- Verifique se as políticas RLS estão configuradas corretamente
- Para desenvolvimento, você pode temporariamente desabilitar RLS (não recomendado para produção)

### Dados não aparecem após migração
- Verifique os logs do script de migração
- Confirme que os dados foram inseridos no Supabase (Table Editor)
- Verifique se o `user_id` está correto (deve corresponder ao ID do Clerk)

## Próximos Passos

Após configurar o Supabase:
1. Teste todas as funcionalidades
2. Remova a dependência `firebase` do `package.json` se não for mais necessária
3. Atualize a documentação do projeto
4. Configure backups automáticos no Supabase (Dashboard → Settings → Database)

