/**
 * Hook utilities for commerce framework
 */

import { useMemo } from 'react'
import useSWR, { SWRConfiguration } from 'swr'
import type { SWRHook, MutationHook, HookFetcherFn, HookFetcherOptions } from './types'

export type UseData<H extends any> = (options?: {
  input?: H['input']
  swrOptions?: SWRConfiguration<H['data'], any>
}) => {
  data?: H['data']
  error?: any
  isLoading: boolean
  isValidating: boolean
}

export function useSWRHook<H extends any>({
  useData,
  fetcher,
}: {
  useData: UseData<H>
  fetcher?: HookFetcherFn<H>
}) {
  return (input?: H['input'] & { swrOptions?: SWRConfiguration<H['data'], any> }) => {
    const { swrOptions, ...hookInput } = input || {}
    return useData({
      input: hookInput,
      swrOptions,
    })
  }
}

export function useHook<P extends any, H extends any>(
  fn: (provider: P) => H,
  fetcher?: HookFetcherFn<H>
) {
  const hook = useMemo(() => {
    // In a real implementation, this would get the provider from context
    // For now, we'll create a mock provider
    const provider = {} as P
    return fn(provider)
  }, [])

  return {
    ...hook,
    fetcher: fetcher || hook.fetcher,
  }
}

export function useMutationHook<H extends any>({
  fetch,
  fetcher,
}: {
  fetch: MutationHook<H>['useHook'] extends (context: any) => infer R ? R : never
  fetcher?: HookFetcherFn<H>
}) {
  return (input?: H['input']) => {
    return (actionInput: H['actionInput']) => {
      return fetch({
        input: actionInput,
      })
    }
  }
}




















