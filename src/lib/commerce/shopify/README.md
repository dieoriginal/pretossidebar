# Shopify Integration

Este diretório contém a integração com a API do Shopify.

## Configuração

Para conectar com o Shopify, adicione as seguintes variáveis de ambiente:

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token
```

## Estrutura

- `api.ts` - Funções para chamar a Storefront API do Shopify
- `queries.ts` - GraphQL queries para produtos, carrinho, etc.
- `mutations.ts` - GraphQL mutations para adicionar ao carrinho, checkout, etc.
- `normalize.ts` - Funções para normalizar dados do Shopify para o formato do commerce framework

## Próximos Passos

1. Implementar queries GraphQL para produtos
2. Implementar mutations para carrinho
3. Implementar checkout
4. Substituir `api/local.ts` com chamadas ao Shopify




















