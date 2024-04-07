import { ConnectionType, DatabaseSchema } from '@shared/types'
import { identify } from 'sql-query-identifier'

export const databaseSchemaToSQL = (type: ConnectionType, schema: DatabaseSchema | undefined) => {
  if (!schema) return ''

  const quote = (input: string) => {
    const char = type === 'mysql' ? '`' : '"'
    return `${char}${input}${char}`
  }

  const tables = schema.tables.map((table) => {
    const columns = table.columns.map((column) => {
      return `${quote(column.name)} ${column.type}${column.nullable ? '' : ' NOT NULL'}`
    })

    return `CREATE TABLE ${quote(table.name)} (\n  ${columns.join(',\n  ')}\n);`
  })

  return tables.join('\n')
}

export const formatConnectionType = (type: ConnectionType) => {
  switch (type) {
    case 'sqlite':
      return 'SQLite'
    case 'postgresql':
      return 'PostgreSQL'
    case 'mysql':
      return 'MySQL'
    default:
      return type
  }
}

export const connectionTypes = ['sqlite', 'postgresql', 'mysql'] as const

export const getConnectionDefaultValues = () => {
  return {
    host: '',
    port: '',
    user: '',
    password: '',
    database: ''
  }
}

export const identifyQueryQuiet = (query: string) => {
  try {
    return identify(query)
  } catch {
    return []
  }
}
