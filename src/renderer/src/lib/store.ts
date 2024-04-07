import { useQuery } from '@tanstack/react-query'
import { actionsProxy } from './actions-proxy'

export const useSchema = (connectionId?: string) =>
  useQuery({
    retry: false,
    refetchOnWindowFocus: false,
    enabled: Boolean(connectionId),
    queryKey: ['databaseSchema', connectionId],
    queryFn: async () => {
      if (!connectionId) return null
      return actionsProxy.connectDatabase.invoke({ connectionId }).then((connection) => {
        if (!connection) {
          throw new Error('database not found')
        }

        return actionsProxy.getDatabaseSchema.invoke({ connection })
      })
    }
  })

export const useSavedQueries = (connectionId: string) => {
  return actionsProxy.getQueries.useQuery({
    connectionId
  })
}

export const useConnections = () => {
  return actionsProxy.getConnections.useQuery()
}
