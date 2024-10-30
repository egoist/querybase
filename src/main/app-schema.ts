import { ConnectionConfig, ConnectionType } from '@shared/types'
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { customAlphabet } from 'nanoid'

const genId = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8)

const defaultRandom = () => genId()

const defaultNow = () => new Date()

export const connection = sqliteTable('connection', {
  id: text().primaryKey().$defaultFn(defaultRandom),
  createdAt: integer({ mode: 'timestamp_ms' }).notNull().$defaultFn(defaultNow),
  nickname: text().notNull(),
  type: text().$type<ConnectionType>().notNull(),
  host: text(),
  port: text(),
  user: text(),
  config: text({ mode: 'json' }).$type<ConnectionConfig>(),
  password: text(),
  database: text().notNull()
})

export const query = sqliteTable(
  'query',
  {
    id: text().primaryKey().$defaultFn(defaultRandom),
    createdAt: integer({ mode: 'timestamp_ms' }).notNull().$defaultFn(defaultNow),
    connectionId: text().notNull(),
    title: text().notNull(),
    query: text().notNull()
  },
  (t) => {
    return {
      connectionId_idx: index('query_connectionId_idx').on(t.connectionId)
    }
  }
)
