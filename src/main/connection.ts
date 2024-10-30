import fs from 'fs'
import { Connection, DatabaseColumn, DatabaseSchema, QueryDatabaseResult } from '@shared/types'
import { identify } from 'sql-query-identifier'
import { appDB, appSchema } from './app-db'
import { eq } from 'drizzle-orm'

type DatabaseInstance = {
  execute<T extends Record<string, unknown> = Record<string, unknown>>(
    query: string,
    variables?: any[]
  ): Promise<{
    rows: T[]
    rowsAffected?: number | null
  }>

  close(): Promise<void>
}
const instances = new Map<string, DatabaseInstance>()

export const disconnectDatabase = async (connectionId: string) => {
  const instance = instances.get(connectionId)
  if (instance) {
    await instance.close()
    instances.delete(connectionId)
  }
}

export const connectDatabase = async (connectionId: string, disabledSSL?: boolean) => {
  const connection = await appDB.query.connection.findFirst({
    where: eq(appSchema.connection.id, connectionId)
  })

  if (!connection) {
    return null
  }

  if (instances.has(connection.id)) {
    return connection
  }

  let db: DatabaseInstance | undefined

  if (connection.type === 'postgresql') {
    const pg = await import('pg')
    const client = new pg.default.Client({
      host: connection.host || '127.0.0.1',
      port: connection.port ? Number(connection.port) : 5432,
      user: connection.user ?? '',
      password: connection.password ?? '',
      database: connection.database,
      ssl: disabledSSL
        ? false
        : {
            rejectUnauthorized: false,
            ca: fs.readFileSync('/etc/ssl/cert.pem')
          }
    })

    try {
      await client.connect()
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('The server does not support SSL connections')
      ) {
        return connectDatabase(connectionId, true)
      }
      throw error
    }

    client.on('end', () => {
      instances.delete(connection.id)
    })

    db = {
      async execute(query, variables) {
        const result = await client.query(query, variables)
        return { rows: result.rows, rowsAffected: result.rowCount }
      },

      async close() {
        await client.end()
      }
    }
  } else if (connection.type === 'mysql') {
    const mysql = await import('mysql2/promise')
    const client = mysql.default.createPool({
      host: connection.host || '127.0.0.1',
      port: connection.port ? Number(connection.port) : 3306,
      user: connection.user ?? '',
      password: connection.password ?? '',
      database: connection.database,
      ssl: {
        ca: fs.readFileSync('/etc/ssl/cert.pem'),
        rejectUnauthorized: false
      },
      enableKeepAlive: true,
      connectionLimit: 3
    })

    db = {
      async execute(query, variables) {
        const [rows] = await client.execute(query, variables)

        return { rows: rows as any, rowsAffected: 0 }
      },

      async close() {
        await client.end()
      }
    }
  } else {
    const { createClient } = await import('@libsql/client')
    const client = createClient({
      url: `file:${connection.database}`
    })

    db = {
      async execute(query, variables) {
        const result = await client.execute({
          sql: query,
          args: variables || []
        })

        return {
          rows: result.rows as any,
          rowsAffected: result.rowsAffected
        }
      },

      async close() {
        instances.delete(connection.id)
        client.close()
      }
    }
  }

  instances.set(connection.id, db)

  return connection
}

export const queryDatabase = async ({
  connectionId,
  query
}: {
  connectionId: string
  query: string
}) => {
  const db = instances.get(connectionId)

  const statements = identify(query)

  const results: QueryDatabaseResult[] = statements.map((statement) => {
    return { statement, rows: [] }
  })

  let hasError = false
  for (const result of results) {
    if (hasError) {
      result.aborted = true
      continue
    }
    try {
      if (!db) {
        throw new Error('No active connection to the database')
      }

      const dbResult = await db.execute(result.statement.text)
      result.rows = dbResult.rows
      result.rowsAffected = dbResult.rowsAffected
    } catch (error) {
      hasError = true
      console.error(error)
      result.error =
        error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error'
    }
  }

  return results
}

export const getDatabaseSchema = async ({
  connection
}: {
  connection: Connection
}): Promise<DatabaseSchema> => {
  const db = instances.get(connection.id)

  if (!db) {
    throw new Error('Database not found')
  }

  const tables = await db
    .execute<{
      table_name: string
    }>(
      connection.type === 'postgresql'
        ? `SELECT table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE' AND table_schema = 'public';`
        : connection.type === 'mysql'
          ? `SELECT table_name as table_name FROM information_schema.tables WHERE table_schema = '${connection.database}';`
          : `SELECT name as table_name FROM sqlite_master WHERE type = 'table';`
    )
    .then((res) => res.rows)

  const tablesWithColumns = await Promise.all(
    tables.map(async (table) => {
      const columns = await db
        .execute<{
          column_name: string
          data_type: string
          is_nullable?: string
          notnull?: number
          column_default: string | null
        }>(
          connection.type === 'postgresql'
            ? `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = '${table.table_name}';`
            : connection.type === 'mysql'
              ? `SELECT column_name as column_name, data_type as data_type, is_nullable as is_nullable, column_default as column_default FROM information_schema.columns WHERE table_name = '${table.table_name}' AND table_schema = '${connection.database}';`
              : `SELECT name as column_name, type as data_type, "notnull", dflt_value as column_default FROM pragma_table_info('${table.table_name}');`
        )
        .then((res) => {
          return res.rows.map((row) => {
            return {
              name: row.column_name,
              type: row.data_type,
              nullable:
                typeof row.notnull === 'number' ? row.notnull === 0 : row.is_nullable === 'YES',
              default: row.column_default
            } satisfies DatabaseColumn
          })
        })
      return { name: table.table_name, columns }
    })
  )

  return {
    tables: tablesWithColumns
  }
}
