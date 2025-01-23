import type { IdentifyResult } from 'sql-query-identifier/lib/defines'
import type { ModelId } from './constants'

export type ConnectionType = 'sqlite' | 'postgresql' | 'mysql'

export type ConnectionConfig = {}

export type Connection = {
  id: string
  createdAt: Date
  nickname: string
  type: ConnectionType
  database: string
  config?: ConnectionConfig | null
  user?: string | null
  password?: string | null
  host?: string | null
  port?: string | null
}

export type Config = {
  openaiApiKey?: string
  openaiApiEndpoint?: string
  anthropicApiKey?: string
  anthropicApiEndpoint?: string
  deepseekApiKey?: string
  model?: ModelId
}

export type DatabaseColumn = {
  name: string
  type: string
  nullable: boolean
  default: string | null
}

export type DatabaseSchema = {
  tables: {
    name: string
    columns: DatabaseColumn[]
  }[]
}

export type Query = {
  id: string
  createdAt: Date
  connectionId: string
  title: string
  query: string
}

export type QueryDatabaseResult = {
  statement: IdentifyResult
  rows: Record<string, unknown>[]
  rowsAffected?: number | null
  error?: string
  aborted?: boolean
}
