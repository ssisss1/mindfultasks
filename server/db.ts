import { createClient, type Client, type Row } from '@libsql/client'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { env } from './env.ts'
import { migrations } from './schema.ts'

/** Narrow a libSQL result row to the shape the caller expects. */
export const one = <T>(rows: Row[]): T | undefined =>
  rows[0] as unknown as T | undefined
export const many = <T>(rows: Row[]): T[] => rows as unknown as T[]

function makeClient(): Client {
  if (env.databaseUrl.startsWith('file:')) {
    const path = env.databaseUrl.slice('file:'.length)
    if (path && path !== ':memory:') {
      mkdirSync(dirname(path), { recursive: true })
    }
  }
  return createClient({ url: env.databaseUrl, authToken: env.databaseAuthToken })
}

export const db = makeClient()

/** Applies pending migrations. Call once at startup before serving. */
export async function initDb(): Promise<void> {
  await db.execute(
    `CREATE TABLE IF NOT EXISTS _migrations (
       name TEXT PRIMARY KEY,
       applied_at TEXT NOT NULL DEFAULT (datetime('now'))
     )`,
  )

  const appliedRows = await db.execute('SELECT name FROM _migrations')
  const applied = new Set(appliedRows.rows.map((row) => row.name as string))

  for (const migration of migrations) {
    if (applied.has(migration.name)) continue
    const statements = migration.sql
      .split(';')
      .map((statement) => statement.trim())
      .filter(Boolean)
    await db.batch(
      [
        ...statements,
        {
          sql: 'INSERT INTO _migrations (name) VALUES (?)',
          args: [migration.name],
        },
      ],
      'write',
    )
    console.log(`[db] applied migration ${migration.name}`)
  }
}
