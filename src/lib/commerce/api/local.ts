/**
 * Local Commerce API
 * Mock implementation for development
 * Will be replaced with Shopify integration
 */

import type { Product, SearchProductsData, Cart, CartItemBody } from "../types";

// Mock products data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "T-shirt Logo",
    description: "T-shirt com logo da Die Pretty",
    slug: "tee-logo",
    images: [
      {
        url: "https://source.unsplash.com/640x640/?tshirt,streetwear",
        altText: "T-shirt Logo",
      },
    ],
    price: {
      value: 25,
      currencyCode: "EUR",
    },
    variants: [
      {
        id: "var-1",
        price: {
          value: 25,
          currencyCode: "EUR",
        },
        availableForSale: true,
      },
    ],
    options: [],
  },
  {
    id: "2",
    name: "Hoodie Die Pretty",
    description: "Hoodie premium com design exclusivo",
    slug: "hoodie-die-pretty",
    images: [
      {
        url: "https://source.unsplash.com/640x640/?hoodie,streetwear",
        altText: "Hoodie Die Pretty",
      },
    ],
    price: {
      value: 45,
      currencyCode: "EUR",
    },
    variants: [
      {
        id: "var-2",
        price: {
          value: 45,
          currencyCode: "EUR",
        },
        availableForSale: true,
      },
    ],
    options: [],
  },
];

export async function getAllProducts(): Promise<Product[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockProducts;
}

export async function getProduct(slug: string): Promise<Product | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockProducts.find((p) => p.slug === slug) || null;
}

export async function searchProducts(
  query?: string
): Promise<SearchProductsData> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  if (!query) {
    return {
      products: mockProducts,
      found: true,
    };
  }

  const filtered = mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description?.toLowerCase().includes(query.toLowerCase())
  );

  return {
    products: filtered,
    found: filtered.length > 0,
  };
}

export async function getCart(cartId: string): Promise<Cart | null> {
  // This will be implemented with Shopify
  return null;
}

export async function addToCart(
  cartId: string | null,
  item: CartItemBody
): Promise<Cart> {
  // This will be implemented with Shopify
  throw new Error("Not implemented");
}




















