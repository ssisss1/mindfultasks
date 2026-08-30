import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { env } from './env.ts'
import { migrations } from './schema.ts'

function openDatabase(): DatabaseSync {
  if (env.databasePath !== ':memory:') {
    mkdirSync(dirname(env.databasePath), { recursive: true })
  }
  const database = new DatabaseSync(env.databasePath)
  database.exec('PRAGMA journal_mode = WAL')
  database.exec('PRAGMA foreign_keys = ON')
  return database
}

function runMigrations(database: DatabaseSync): void {
  database.exec(
    `CREATE TABLE IF NOT EXISTS _migrations (
       name TEXT PRIMARY KEY,
       applied_at TEXT NOT NULL DEFAULT (datetime('now'))
     )`,
  )
  const applied = new Set(
    database
      .prepare('SELECT name FROM _migrations')
      .all()
      .map((row) => (row as { name: string }).name),
  )
  const insert = database.prepare('INSERT INTO _migrations (name) VALUES (?)')
  for (const migration of migrations) {
    if (applied.has(migration.name)) continue
    database.exec('BEGIN')
    try {
      database.exec(migration.sql)
      insert.run(migration.name)
      database.exec('COMMIT')
      console.log(`[db] applied migration ${migration.name}`)
    } catch (error) {
      database.exec('ROLLBACK')
      throw error
    }
  }
}

export const db = openDatabase()
runMigrations(db)
