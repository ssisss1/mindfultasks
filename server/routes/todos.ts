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

/** libSQL `datetime('now')` yields "YYYY-MM-DD HH:MM:SS" in UTC, no zone marker. */
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

todoRoutes.get('/', async (c) => {
  const result = await db.execute({
    sql: `SELECT id, title, completed, created_at
            FROM todos WHERE user_id = ?
           ORDER BY created_at DESC, rowid DESC`,
    args: [c.get('user').id],
  })
  return c.json({ todos: (result.rows as unknown as TodoRow[]).map(serialize) })
})

const createBody = z.object({ title: z.string().trim().min(1).max(500) })

todoRoutes.post('/', async (c) => {
  const parsed = createBody.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'A title is required' }, 400)

  const id = newTodoId()
  await db.execute({
    sql: 'INSERT INTO todos (id, user_id, title) VALUES (?, ?, ?)',
    args: [id, c.get('user').id, parsed.data.title],
  })

  const result = await db.execute({
    sql: 'SELECT id, title, completed, created_at FROM todos WHERE id = ?',
    args: [id],
  })
  return c.json({ todo: serialize(result.rows[0] as unknown as TodoRow) }, 201)
})

const updateBody = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  completed: z.boolean().optional(),
})

todoRoutes.patch('/:id', async (c) => {
  const parsed = updateBody.safeParse(await c.req.json().catch(() => null))
  if (
    !parsed.success ||
    (parsed.data.title === undefined && parsed.data.completed === undefined)
  ) {
    return c.json({ error: 'Nothing to update' }, 400)
  }

  const id = c.req.param('id')
  const owned = await db.execute({
    sql: 'SELECT id FROM todos WHERE id = ? AND user_id = ?',
    args: [id, c.get('user').id],
  })
  if (owned.rows.length === 0) return c.json({ error: 'Todo not found' }, 404)

  const sets: string[] = []
  const args: (string | number)[] = []
  if (parsed.data.title !== undefined) {
    sets.push('title = ?')
    args.push(parsed.data.title)
  }
  if (parsed.data.completed !== undefined) {
    sets.push('completed = ?')
    args.push(parsed.data.completed ? 1 : 0)
  }
  sets.push("updated_at = datetime('now')")
  args.push(id)

  await db.execute({
    sql: `UPDATE todos SET ${sets.join(', ')} WHERE id = ?`,
    args,
  })

  const result = await db.execute({
    sql: 'SELECT id, title, completed, created_at FROM todos WHERE id = ?',
    args: [id],
  })
  return c.json({ todo: serialize(result.rows[0] as unknown as TodoRow) })
})

todoRoutes.delete('/:id', async (c) => {
  const result = await db.execute({
    sql: 'DELETE FROM todos WHERE id = ? AND user_id = ?',
    args: [c.req.param('id'), c.get('user').id],
  })
  if (result.rowsAffected === 0) return c.json({ error: 'Todo not found' }, 404)
  return c.json({ ok: true })
})
