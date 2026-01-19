/**
 * Shopify Commerce Configuration
 * Placeholder for Shopify integration
 */

export const shopifyConfig = {
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "",
  storefrontToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "",
  apiVersion: "2024-01",
};

export function isShopifyConfigured(): boolean {
  return !!(
    shopifyConfig.storeDomain && shopifyConfig.storefrontToken
  );
}




















