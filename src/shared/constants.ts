export const models = [
  {
    label: 'GPT-3.5 Turbo',
    value: 'gpt-3.5-turbo' as const
  },
  {
    label: 'GPT-4 Turbo',
    value: 'gpt-4-turbo' as const,
    realModelId: 'gpt-4-turbo-preview'
  },
  {
    label: 'GPT-4o',
    value: 'gpt-4o' as const
  },
  {
    label: 'GPT-4o mini',
    value: 'gpt-4o-mini' as const
  },
  {
    label: 'Claude 3 Haiku',
    value: 'claude-3-haiku' as const,
    realModelId: 'claude-3-haiku-20240307'
  },
  {
    label: 'Claude 3 Sonnet',
    value: 'claude-3-sonnet' as const,
    realModelId: 'claude-3-sonnet-20240229'
  },
  {
    label: 'Claude 3 Opus',
    value: 'claude-3-opus' as const,
    realModelId: 'claude-3-opus-latest'
  },
  {
    label: 'Claude 3.5 Sonnet',
    value: 'claude-3.5-sonnet' as const,
    realModelId: 'claude-3-5-sonnet-latest'
  }
]

export type ModelId = (typeof models)[number]['value']
