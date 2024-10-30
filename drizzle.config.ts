import type { Config } from 'drizzle-kit'

export default {
  dialect: 'sqlite',
  schema: './src/main/app-schema.ts',
  out: './migrations',
  dbCredentials: {
    url: 'file:temp/app.db'
  }
} satisfies Config
