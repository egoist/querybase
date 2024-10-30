import { Config, ConnectionType } from '@shared/types'
import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { ModelId, models } from '@shared/constants'

const createProvider = (config: Config, model: ModelId) => {
  if (model.startsWith('claude-')) {
    if (!config.anthropicApiKey) {
      throw new Error('Missing Anthropic API Key')
    }

    return createAnthropic({
      apiKey: config.anthropicApiKey,
      baseURL: config.anthropicApiEndpoint
    })
  }

  if (!config.openaiApiKey) {
    throw new Error('Missing OpenAI API Key')
  }

  return createOpenAI({
    baseURL: config.openaiApiEndpoint,
    apiKey: config.openaiApiKey || ''
  })
}

const sendMessages = async ({
  config,
  messages,
  maxTokens
}: {
  config: Config
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
  maxTokens?: number
}) => {
  const modelId = config.model || 'gpt-3.5-turbo'

  const provider = createProvider(config, modelId)

  const model = models.find((m) => m.value === modelId)!

  const result = await generateText({
    model: provider(model.realModelId || model.value),
    maxTokens: maxTokens || 1024,
    messages,
    temperature: 0
  })

  return { content: result.text }
}

export const generateSQL = async (options: {
  connecttionType: ConnectionType
  config: Config
  schema: string
  input: string
}) => {
  const content = [
    `Database type: ${options.connecttionType}\n`,
    options.schema ? `Database schema:\n${options.schema}\n\n` : '',
    `Generate an SQL query${options.schema ? ' based on provided schema' : ''} for the question: ${options.input}\n\nReturn the SQL directly without any other text, do NOT wrap in code block, table name and column name should be escaped with quotes.`
  ].join('')

  const output = await sendMessages({
    config: options.config,
    messages: [{ role: 'user', content: content }]
  })

  return output
}

export const generateFixForError = async (options: {
  type: ConnectionType
  error: string
  query: string
  config: Config
}) => {
  const content = [
    ` Generate a fix for the following error when querying a ${options.type} database:\n\n${options.error}\n\nThe query that caused the error is:\n\n${options.query}\n\nReturn in the following forma:\nCorrect query:\n\`\`\`\n<correct query>\n\`\`\`\n\n<reason>`
  ].join('')

  const output = await sendMessages({
    config: options.config,
    messages: [{ role: 'user', content: content }]
  })

  return output
}
