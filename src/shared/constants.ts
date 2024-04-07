export const models = [
  {
    label: 'GPT-3.5 Turbo',
    value: 'gpt-3.5-turbo' as const
  },
  {
    label: 'GPT-4 Turbo',
    value: 'gpt-4-turbo' as const
  },
  {
    label: 'Claude 3 Haiku',
    value: 'claude-3-haiku' as const
  },
  {
    label: 'Claude 3 Sonnet',
    value: 'claude-3-sonnet' as const
  },
  {
    label: 'Claude 3 Opus',
    value: 'claude-3-opus' as const
  }
]

export type ModelId = (typeof models)[number]['value']
