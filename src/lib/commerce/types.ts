/**
 * Commerce Types
 * Base types for the commerce framework
 */

export type Money = {
  value: number
  currencyCode: string
}

export type Image = {
  url: string
  altText?: string
  width?: number
  height?: number
}

export type ProductOption = {
  id: string
  displayName: string
  values: ProductOptionValue[]
}

export type ProductOptionValue = {
  label: string
  hexColors?: string[]
}

export type ProductVariant = {
  id: string
  sku?: string
  name?: string
  price: Money
  listPrice?: Money
  requiresShipping?: boolean
  availableForSale?: boolean
  image?: Image
  selectedOptions?: {
    name: string
    value: string
  }[]
}

export type Product = {
  id: string
  name: string
  description?: string
  descriptionHtml?: string
  slug?: string
  path?: string
  images: Image[]
  variants: ProductVariant[]
  price: Money
  options: ProductOption[]
  vendor?: string
}

export type LineItem = {
  id: string
  variantId: string
  productId: string
  name: string
  path: string
  quantity: number
  discounts: Array<{ amountSaved: Money }>
  variant?: ProductVariant
  product?: Product
  options?: Array<{ name: string; value: string }>
}

export type Cart = {
  id: string
  createdAt: string
  currency: { code: string }
  taxesIncluded: boolean
  lineItemsSubtotalPrice: Money
  totalPrice: Money
  lineItems: LineItem[]
  subtotalPrice: Money
}

export type CartItemBody = {
  variantId: string | number
  productId?: string | number
  quantity?: number
}

export type SearchProductsBody = {
  search?: string
  categoryId?: string | number
  brandId?: string | number
  sort?: string
  locale?: string
}

export type SearchProductsData = {
  products: Product[]
  found: boolean
}




















