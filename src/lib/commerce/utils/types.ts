/**
 * Commerce Hook Types
 * Types for SWR and Mutation hooks
 */

import type { SWRConfiguration } from 'swr'

export type Fetcher<T = any, B = any> = (
  options: FetcherOptions<B>
) => T | Promise<T>

export type FetcherOptions<Body = any> = {
  url?: string
  query?: string
  method?: string
  variables?: any
  body?: Body
}

export type HookFetcherFn<H extends HookSchemaBase> = (
  context: HookFetcherContext<H>
) => H['data'] | Promise<H['data']>

export type HookFetcherContext<H extends HookSchemaBase> = {
  options: HookFetcherOptions
  input: H['fetcherInput']
  fetch: <
    T = H['fetchData'] extends {} | null ? H['fetchData'] : any,
    B = H['body']
  >(
    options: FetcherOptions<B>
  ) => Promise<T>
}

export type HookFetcherOptions = { method?: string } & (
  | { query: string; url?: string }
  | { query?: string; url: string }
)

export type HookInputValue = string | number | boolean | null | undefined

export type HookSWRInput = [string, HookInputValue][]

export type HookFetchInput = { [k: string]: HookInputValue }

export type HookFunction<
  Input extends { [k: string]: unknown } | undefined,
  T
> = keyof Input extends never
  ? () => T
  : Partial<Input> extends Input
  ? (input?: Input) => T
  : (input: Input) => T

export type HookSchemaBase = {
  data: any
  input?: {}
  fetcherInput?: {}
  body?: {}
  fetchData?: any
}

export type SWRHookSchemaBase = HookSchemaBase & {
  swrState?: {}
  mutations?: Record<string, ReturnType<MutationHook<any>['useHook']>>
}

export type MutationSchemaBase = HookSchemaBase & {
  actionInput?: {}
}

export type SWRHook<H extends SWRHookSchemaBase> = {
  useHook(
    context: SWRHookContext<H>
  ): HookFunction<
    H['input'] & { swrOptions?: SwrOptions<H['data'], H['fetcherInput']> },
    ResponseState<H['data']> & H['swrState'] & H['mutations']
  >
  fetchOptions: HookFetcherOptions
  fetcher?: HookFetcherFn<H>
}

export type SWRHookContext<H extends SWRHookSchemaBase> = {
  useData(context?: {
    input?: HookFetchInput | HookSWRInput
    swrOptions?: SwrOptions<H['data'], H['fetcherInput']>
  }): ResponseState<H['data']>
}

export type MutationHook<H extends MutationSchemaBase> = {
  useHook(
    context: MutationHookContext<H>
  ): HookFunction<
    H['input'],
    HookFunction<H['actionInput'], H['data'] | Promise<H['data']>>
  >
  fetchOptions: HookFetcherOptions
  fetcher?: HookFetcherFn<H>
}

export type MutationHookContext<H extends MutationSchemaBase> = {
  fetch: keyof H['fetcherInput'] extends never
    ? () => H['data'] | Promise<H['data']>
    : Partial<H['fetcherInput']> extends H['fetcherInput']
    ? (context?: {
        input?: H['fetcherInput']
      }) => H['data'] | Promise<H['data']>
    : (context: { input: H['fetcherInput'] }) => H['data'] | Promise<H['data']>
}

export type SwrOptions<Data, Input = null, Result = any> = SWRConfiguration<
  Data,
  any,
  any
>

export type ResponseState<T> = {
  data?: T
  error?: any
  isLoading: boolean
  isValidating: boolean
}




















