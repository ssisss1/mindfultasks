import { Hono } from 'hono'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { db } from '../db.ts'
import { requireAuth, type AppEnv } from '../middleware.ts'

export const meditationRoutes = new Hono<AppEnv>()

meditationRoutes.use('*', requireAuth)

const logBody = z.object({
  durationMinutes: z.number().int().min(1).max(120),
})

meditationRoutes.post('/sessions', async (c) => {
  const parsed = logBody.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'Invalid duration' }, 400)

  db.prepare(
    'INSERT INTO meditation_sessions (id, user_id, duration_minutes) VALUES (?, ?, ?)',
  ).run(
    'med_' + randomBytes(12).toString('hex'),
    c.get('user').id,
    parsed.data.durationMinutes,
  )
  return c.json({ ok: true }, 201)
})

meditationRoutes.get('/stats', (c) => {
  const row = db
    .prepare(
      `SELECT
         COUNT(*) AS sessions,
         COALESCE(SUM(duration_minutes), 0) AS minutes
       FROM meditation_sessions
       WHERE user_id = ? AND created_at >= datetime('now', '-7 days')`,
    )
    .get(c.get('user').id) as { sessions: number; minutes: number }

  const total = db
    .prepare(
      'SELECT COUNT(*) AS sessions FROM meditation_sessions WHERE user_id = ?',
    )
    .get(c.get('user').id) as { sessions: number }

  return c.json({
    last7Days: { sessions: row.sessions, minutes: row.minutes },
    allTime: { sessions: total.sessions },
  })
})
