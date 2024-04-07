import { useQuery } from '@tanstack/react-query'
import { actionsProxy } from './actions-proxy'
import { Config } from '@shared/types'
import { queryClient } from './query-client'

export const useConfig = () =>
  useQuery({
    queryKey: ['config'],
    queryFn: () => actionsProxy.loadConfig.invoke()
  })

export const saveConfig = async (partialConfig: Partial<Config>) => {
  queryClient.setQueryData(['config'], (prev) => {
    if (!prev) return prev
    return { ...prev, ...partialConfig }
  })

  const currentConfig = await actionsProxy.loadConfig.invoke()
  await actionsProxy.saveConfig.invoke({ config: { ...currentConfig, ...partialConfig } })
}
