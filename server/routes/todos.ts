import { Hono } from 'hono'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { db } from '../db.ts'
import { requireAuth, type AppEnv } from '../middleware.ts'

interface TodoRow {
  id: string
  title: string
  completed: number
  created_at: string
}

/** SQLite `datetime('now')` yields "YYYY-MM-DD HH:MM:SS" in UTC, no zone marker. */
function sqliteUtcToMillis(value: string): number {
  return new Date(value.replace(' ', 'T') + 'Z').getTime()
}

function serialize(row: TodoRow) {
  return {
    id: row.id,
    title: row.title,
    completed: Boolean(row.completed),
    createdAt: sqliteUtcToMillis(row.created_at),
  }
}

function newTodoId(): string {
  return 'todo_' + randomBytes(12).toString('hex')
}

export const todoRoutes = new Hono<AppEnv>()

todoRoutes.use('*', requireAuth)

todoRoutes.get('/', (c) => {
  const rows = db
    .prepare(
      `SELECT id, title, completed, created_at
         FROM todos WHERE user_id = ?
        ORDER BY created_at DESC, rowid DESC`,
    )
    .all(c.get('user').id) as unknown as TodoRow[]
  return c.json({ todos: rows.map(serialize) })
})

const createBody = z.object({ title: z.string().trim().min(1).max(500) })

todoRoutes.post('/', async (c) => {
  const parsed = createBody.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'A title is required' }, 400)

  const id = newTodoId()
  db.prepare(
    'INSERT INTO todos (id, user_id, title) VALUES (?, ?, ?)',
  ).run(id, c.get('user').id, parsed.data.title)

  const row = db
    .prepare('SELECT id, title, completed, created_at FROM todos WHERE id = ?')
    .get(id) as unknown as TodoRow
  return c.json({ todo: serialize(row) }, 201)
})

const updateBody = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  completed: z.boolean().optional(),
})

todoRoutes.patch('/:id', async (c) => {
  const parsed = updateBody.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success || (parsed.data.title === undefined && parsed.data.completed === undefined)) {
    return c.json({ error: 'Nothing to update' }, 400)
  }

  const owned = db
    .prepare('SELECT id FROM todos WHERE id = ? AND user_id = ?')
    .get(c.req.param('id'), c.get('user').id)
  if (!owned) return c.json({ error: 'Todo not found' }, 404)

  const sets: string[] = []
  const values: unknown[] = []
  if (parsed.data.title !== undefined) {
    sets.push('title = ?')
    values.push(parsed.data.title)
  }
  if (parsed.data.completed !== undefined) {
    sets.push('completed = ?')
    values.push(parsed.data.completed ? 1 : 0)
  }
  sets.push("updated_at = datetime('now')")
  values.push(c.req.param('id'))

  db.prepare(`UPDATE todos SET ${sets.join(', ')} WHERE id = ?`).run(...(values as never[]))

  const row = db
    .prepare('SELECT id, title, completed, created_at FROM todos WHERE id = ?')
    .get(c.req.param('id')) as unknown as TodoRow
  return c.json({ todo: serialize(row) })
})

todoRoutes.delete('/:id', (c) => {
  const result = db
    .prepare('DELETE FROM todos WHERE id = ? AND user_id = ?')
    .run(c.req.param('id'), c.get('user').id)
  if (result.changes === 0) return c.json({ error: 'Todo not found' }, 404)
  return c.json({ ok: true })
})
