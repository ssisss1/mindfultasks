/**
 * Ordered list of migrations. Each runs once; applied names are tracked in the
 * `_migrations` table. Append new entries — never edit an applied one.
 */
export const migrations: { name: string; sql: string }[] = [
  {
    name: '001_init',
    sql: `
      CREATE TABLE users (
        id            TEXT PRIMARY KEY,
        email         TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at    TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE sessions (
        token      TEXT PRIMARY KEY,
        user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        expires_at TEXT NOT NULL
      );
      CREATE INDEX idx_sessions_user ON sessions(user_id);

      CREATE TABLE todos (
        id         TEXT PRIMARY KEY,
        user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title      TEXT NOT NULL,
        completed  INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX idx_todos_user ON todos(user_id, created_at DESC);

      CREATE TABLE meditation_sessions (
        id               TEXT PRIMARY KEY,
        user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        duration_minutes INTEGER NOT NULL,
        created_at       TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX idx_meditation_user ON meditation_sessions(user_id, created_at DESC);
    `,
  },
]
