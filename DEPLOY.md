# Guia de Deploy - PRETOS MUSIC

## ✅ Checklist de Implementação Completa

Todas as funcionalidades foram implementadas! Agora só falta configurar as variáveis de ambiente e fazer deploy.

## 🔧 Configuração Necessária

### 1. Variáveis de Ambiente

Criar arquivo `.env.local` na raiz do projeto:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_UNDERGROUND_ANNUAL=price_...

# Sentry Error Tracking (Opcional)
NEXT_PUBLIC_SENTRY_DSN=https://...

# App URL
NEXT_PUBLIC_APP_URL=https://seu-dominio.com

# SMTP (Opcional - para emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@pretosmusic.com
```

### 2. Configurar Stripe

1. **Criar conta no Stripe**: https://stripe.com
2. **Criar produto**:
   - Nome: "Underground Annual"
   - Preço: 5.00 EUR
   - Intervalo: Anual
   - Copiar o Price ID e colocar em `STRIPE_PRICE_ID_UNDERGROUND_ANNUAL`
3. **Configurar Webhook**:
   - Dashboard Stripe → Developers → Webhooks
   - Adicionar endpoint: `https://seu-dominio.com/api/subscriptions/webhook`
   - Eventos a ouvir:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copiar o Webhook Secret para `STRIPE_WEBHOOK_SECRET`

### 3. Configurar Clerk

1. **Criar conta no Clerk**: https://clerk.com
2. **Criar aplicação**
3. **Copiar chaves** para as variáveis de ambiente
4. **Configurar URLs**:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/`
   - After sign-up: `/`

### 4. Configurar Sentry (Opcional)

1. **Criar conta no Sentry**: https://sentry.io
2. **Criar projeto Next.js**
3. **Copiar DSN** para `NEXT_PUBLIC_SENTRY_DSN`

## 🚀 Deploy

### Vercel (Recomendado)

1. **Instalar Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Fazer deploy**:
   ```bash
   vercel
   ```

3. **Adicionar variáveis de ambiente** no dashboard da Vercel

4. **Configurar domínio** (opcional)

### Outras Plataformas

- **Netlify**: Similar ao Vercel
- **Railway**: Suporta Next.js nativamente
- **DigitalOcean App Platform**: Boa opção para produção

## 📋 Checklist Final

- [ ] Variáveis de ambiente configuradas
- [ ] Stripe configurado e testado
- [ ] Clerk configurado
- [ ] Sentry configurado (opcional)
- [ ] Webhook do Stripe configurado
- [ ] Domínio configurado
- [ ] SSL/HTTPS ativo
- [ ] Testar fluxo completo:
  - [ ] Sign up
  - [ ] Onboarding
  - [ ] Criar projeto
  - [ ] Checkout Stripe
  - [ ] Webhook recebido
  - [ ] Subscrição ativa
  - [ ] Quotas funcionando
  - [ ] Backup funcionando

## 🐛 Troubleshooting

### Webhook não funciona
- Verificar se o endpoint está acessível publicamente
- Verificar se o webhook secret está correto
- Verificar logs no Stripe Dashboard

### Subscrição não atualiza
- Verificar se o webhook está configurado corretamente
- Verificar logs do servidor
- Testar webhook manualmente no Stripe Dashboard

### Erros de autenticação
- Verificar se as chaves do Clerk estão corretas
- Verificar se as URLs estão configuradas no Clerk

## 📞 Suporte

Para questões ou problemas, verificar:
- `/help` - FAQ e ajuda
- `/privacy` - Política de privacidade
- `/terms` - Termos de serviço

---

**Pronto para lançar! 🚀**

