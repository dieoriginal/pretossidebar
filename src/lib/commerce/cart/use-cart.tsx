/**
 * useCart hook
 */

import Cookies from 'js-cookie'
import { useMemo } from 'react'
import useSWR from 'swr'
import type { Cart } from '../types'
import type { SWRHook } from '../utils/types'
import { useSWRHook } from '../utils/use-hook'

export type GetCartHook = {
  data: Cart | null
  input: {}
  fetcherInput: { cartId?: string }
  swrState: {
    isEmpty: boolean
  }
}

export const fetcher = async ({
  url,
  query,
  variables,
}: {
  url?: string
  query?: string
  variables?: { cartId?: string }
}) => {
  // This will be replaced with actual API call
  if (!variables?.cartId) {
    return null
  }
  return null
}

const useCart: SWRHook<GetCartHook>['useHook'] = (useData) => {
  const cartCookie = 'session' // This should come from commerce config

  return (input) => {
    const cartId = Cookies.get(cartCookie)
    const response = useData({
      input: ['cart', cartId],
      swrOptions: {
        revalidateOnFocus: false,
      },
    })

    return useMemo(
      () =>
        Object.create(response, {
          isEmpty: {
            get() {
              return (response.data?.lineItems?.length ?? 0) <= 0
            },
            enumerable: true,
          },
        }),
      [response]
    )
  }
}

export default useCart




















