import { Hono } from 'hono'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { db, one } from '../db.ts'
import { requireAuth, type AppEnv } from '../middleware.ts'

export const meditationRoutes = new Hono<AppEnv>()

meditationRoutes.use('*', requireAuth)

const logBody = z.object({
  durationMinutes: z.number().int().min(1).max(120),
})

meditationRoutes.post('/sessions', async (c) => {
  const parsed = logBody.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'Invalid duration' }, 400)

  await db.execute({
    sql: 'INSERT INTO meditation_sessions (id, user_id, duration_minutes) VALUES (?, ?, ?)',
    args: [
      'med_' + randomBytes(12).toString('hex'),
      c.get('user').id,
      parsed.data.durationMinutes,
    ],
  })
  return c.json({ ok: true }, 201)
})

meditationRoutes.get('/stats', async (c) => {
  const userId = c.get('user').id

  const recent = await db.execute({
    sql: `SELECT
            COUNT(*) AS sessions,
            COALESCE(SUM(duration_minutes), 0) AS minutes
          FROM meditation_sessions
          WHERE user_id = ? AND created_at >= datetime('now', '-7 days')`,
    args: [userId],
  })
  const total = await db.execute({
    sql: 'SELECT COUNT(*) AS sessions FROM meditation_sessions WHERE user_id = ?',
    args: [userId],
  })

  const row = one<{ sessions: number; minutes: number }>(recent.rows)
  const totalRow = one<{ sessions: number }>(total.rows)

  return c.json({
    last7Days: {
      sessions: Number(row?.sessions ?? 0),
      minutes: Number(row?.minutes ?? 0),
    },
    allTime: { sessions: Number(totalRow?.sessions ?? 0) },
  })
})
