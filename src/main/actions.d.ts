import type {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'

type Actions = typeof import('./actions').actions

// remove the first argument of each object method
export type ActionsProxy = {
  [K in keyof Actions]: {
    invoke: Actions[K] extends (context: any, input: infer P) => Promise<infer R>
      ? (input: P) => Promise<R>
      : never

    useMutation: Actions[K] extends (context: any, input: infer P) => Promise<infer R>
      ? (mutationOptions?: UseMutationOptions<R, Error, P>) => UseMutationResult<R, Error, P>
      : never

    useQuery: Actions[K] extends (context: any, input: infer P) => Promise<infer R>
      ? (
          variables: P,
          queryOptions?: Omit<UseQueryOptions<R, Error, P>, 'queryKey'>
        ) => UseQueryResult<R, Error>
      : never

    setQueryData: Actions[K] extends (context: any, input: infer P) => Promise<infer R>
      ? (variables: P, updater: (prev: R | undefined) => R | undefined) => R | undefined
      : never

    removeQueryCache: Actions[K] extends (context: any, input: infer P) => Promise<infer R>
      ? () => void
      : never
  }
}
