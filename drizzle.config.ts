import type { Config } from 'drizzle-kit'

export default {
  driver: 'better-sqlite',
  schema: './src/main/app-schema.ts',
  out: './migrations'
} satisfies Config
