import * as appSchema from './app-schema'
import fs from 'fs'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { createClient } from '@libsql/client'
import path from 'path'
import { app } from 'electron'

const dbPath = import.meta.env.DEV ? 'temp/app.db' : path.join(app.getPath('userData'), 'app.db')

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const db = createClient({
  url: `file:${dbPath}`
})

export const appDB = drizzle(db, { schema: appSchema })

export { appSchema }

export const runMigrations = async () => {
  // Enable WAL
  await db.execute('PRAGMA journal_mode = WAL')

  if (import.meta.env.PROD) {
    await migrate(appDB, {
      migrationsFolder: path.join(__dirname, '../../migrations')
    })
  }
}
