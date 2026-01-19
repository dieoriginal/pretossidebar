/**
 * useSearch hook for products
 */

import { useMemo } from 'react'
import useSWR from 'swr'
import type { Product, SearchProductsBody, SearchProductsData } from '../types'
import type { SWRHook } from '../utils/types'
import { useSWRHook } from '../utils/use-hook'

export type SearchProductsHook = {
  data: SearchProductsData
  input: SearchProductsBody
  fetcherInput: SearchProductsBody
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
  variables?: SearchProductsBody
}) => {
  // This will be replaced with actual API call
  // For now, return mock data
  return {
    products: [],
    found: false,
  }
}

const useSearch: SWRHook<SearchProductsHook>['useHook'] = (useData) => {
  return (input) => {
    const response = useData({
      input: ['search', input?.search || '', input?.categoryId, input?.sort],
      swrOptions: {
        revalidateOnFocus: false,
      },
    })

    return useMemo(
      () =>
        Object.create(response, {
          isEmpty: {
            get() {
              return (response.data?.found ?? false) && response.data?.products?.length === 0
            },
            enumerable: true,
          },
        }),
      [response]
    )
  }
}

export default useSearch




















