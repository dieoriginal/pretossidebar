/**
 * useAddItem hook for adding items to cart
 */

import Cookies from 'js-cookie'
import type { Cart, CartItemBody } from '../types'
import type { MutationHook } from '../utils/types'

export type AddItemHook = {
  data: Cart
  input: CartItemBody
  fetcherInput: CartItemBody & { cartId?: string }
  actionInput: CartItemBody
}

export const fetcher = async ({
  url,
  query,
  variables,
}: {
  url?: string
  query?: string
  variables?: AddItemHook['fetcherInput']
}) => {
  // This will be replaced with actual API call
  return null as any
}

const useAddItem: MutationHook<AddItemHook>['useHook'] = (fetch) => {
  const cartCookie = 'session' // This should come from commerce config

  return (input) => {
    return async (actionInput: CartItemBody) => {
      const cartId = Cookies.get(cartCookie)
      return fetch({
        input: {
          ...actionInput,
          cartId,
        },
      })
    }
  }
}

export default useAddItem




















