import { Config, ConnectionType } from '@shared/types'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

const sendMessages = async ({
  config,
  messages,
  maxTokens
}: {
  config: Config
  messages: { role: 'user' | 'assistant'; content: string }[]
  maxTokens?: number
}) => {
  const model = config.model || 'gpt-3.5-turbo'

  let content = ''

  if (model.startsWith('claude-3')) {
    if (!config.anthropicApiKey) {
      throw new Error('Missing Anthropic API Key')
    }

    const anthropic = new Anthropic({
      apiKey: config.anthropicApiKey,
      baseURL: config.anthropicApiEndpoint
    })

    const msg = await anthropic.messages.create({
      model:
        model === 'claude-3-haiku'
          ? 'claude-3-haiku-20240307'
          : model === 'claude-3-sonnet'
            ? '	claude-3-sonnet-20240229'
            : 'claude-3-opus-20240229',
      max_tokens: maxTokens || 1024,
      messages
    })

    content = msg.content[0].text
  } else {
    if (!config.openaiApiKey) {
      throw new Error('Missing OpenAI API Key')
    }

    const openai = new OpenAI({
      baseURL: config.openaiApiEndpoint,
      apiKey: config.openaiApiKey || '',
      dangerouslyAllowBrowser: true
    })

    const result = await openai.chat.completions.create({
      model: model === 'gpt-3.5-turbo' ? 'gpt-4-turbo-preview' : model,
      max_tokens: maxTokens,
      messages
    })

    content = result.choices[0].message.content?.trim() || ''
  }

  return { content }
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
    `Generate an SQL query${options.schema ? ' based on provided schema' : ''} for the question: ${options.input}\n\nReturn the SQL directly without any other text, do NOT wrap in code block, table name and column name should be escaped with quotes. If you can determine the SQL simply reply "I don't know".`
  ].join('')

  const maxTokens = 1024

  const output = await sendMessages({
    config: options.config,
    maxTokens,
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

  const maxTokens = 1024
  const output = await sendMessages({
    config: options.config,
    maxTokens,
    messages: [{ role: 'user', content: content }]
  })

  return output
}
