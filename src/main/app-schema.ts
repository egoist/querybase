import { ConnectionConfig, ConnectionType } from '@shared/types'
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { customAlphabet } from 'nanoid'

const genId = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8)

const defaultRandom = () => genId()

const defaultNow = () => new Date()

export const connection = sqliteTable('connection', {
  id: text('id').primaryKey().$defaultFn(defaultRandom),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(defaultNow),
  nickname: text('nickname').notNull(),
  type: text('type').$type<ConnectionType>().notNull(),
  host: text('host'),
  port: text('port'),
  user: text('user'),
  config: text('config', { mode: 'json' }).$type<ConnectionConfig>(),
  password: text('password'),
  database: text('database').notNull()
})

export const query = sqliteTable(
  'query',
  {
    id: text('id').primaryKey().$defaultFn(defaultRandom),
    createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(defaultNow),
    connectionId: text('connectionId').notNull(),
    title: text('title').notNull(),
    query: text('query').notNull()
  },
  (t) => {
    return {
      connectionId_idx: index('query_connectionId_idx').on(t.connectionId)
    }
  }
)
