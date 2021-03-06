export type QueryResponse<T> =
  | {
      type: "success"
      data: T
    }
  | {
      type: "error"
      error: string
    }

export type QueryBase = {
  getAllDatabases: GetAllDatabases
  createConnection: CreateConnection
  executeQuery: ExecuteQuery
  getTables: GetTables
  showErrorDialog: ShowErrorDialog
}

export type Connection =
  | {
      type: "pg" | "mysql"
      id: string
      nickname: string
      host: string
      user: string
      port: number
      database: string
      password: string
    }
  | { type: "sqlite"; id: string; nickname: string; file: string }

export type GetAllDatabases = () => Promise<QueryResponse<string[]>>

export type CreateConnection = (
  args: Connection
) => Promise<QueryResponse<void>>

export type ExecuteQuery = (args: {
  query: string
}) => Promise<QueryResponse<{ rows: any[]; fields: string[] }>>

export type Table = { name: string; schema: string; type: string }

export type GetTables = () => Promise<
  QueryResponse<{ tables: Table[]; schemas: string[] }>
>

export type ShowErrorDialog = (args: {
  title: string
  content: string
}) => Promise<void>
