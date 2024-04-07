import * as appSchema from './app-schema'
import fs from 'fs'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'

const dbPath = import.meta.env.DEV ? 'temp/app.db' : path.join(app.getPath('userData'), 'app.db')

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const db = new Database(dbPath)

// Enable WAL
db.pragma('journal_mode = WAL')

export const appDB = drizzle(db, { schema: appSchema })

export { appSchema }

export const runMigrations = () => {
  migrate(appDB, {
    migrationsFolder: path.join(__dirname, '../../migrations')
  })
}
