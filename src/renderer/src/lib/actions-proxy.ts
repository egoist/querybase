import { useMutation, useQuery } from '@tanstack/react-query'
import type { ActionsProxy } from '../../../main/actions.d'
import { queryClient } from './query-client'

export const actionsProxy = new Proxy<ActionsProxy>({} as any, {
  get: (_, prop) => {
    const invoke = (input: any) => {
      return window.electron.ipcRenderer.invoke(prop.toString(), input)
    }

    return {
      invoke,

      useMutation: (mutationOptions?: any) => {
        return useMutation({
          ...mutationOptions,
          mutationFn: invoke
        })
      },

      useQuery: (variables: any, queryOptions?: any) => {
        return useQuery({
          ...queryOptions,
          queryKey: [prop.toString(), variables],
          queryFn: () => invoke(variables)
        })
      },

      setQueryData: (variables: unknown, updater: unknown) => {
        return queryClient.setQueryData([prop.toString(), variables], updater)
      },

      removeQueryCache: () => {
        queryClient.removeQueries({
          queryKey: [prop.toString()]
        })
      }
    }
  }
})
