import { customAlphabet } from 'nanoid'

export const genId = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8)

export const formatError = (error: unknown) => {
  let message = ''

  if (typeof error === 'string') {
    message = error
  } else if (error instanceof Error) {
    message = error.message
  } else {
    message = JSON.stringify(error)
  }

  return message.replace(/Error invoking remote method '.+':\s+(error:\s+)?/, '')
}
