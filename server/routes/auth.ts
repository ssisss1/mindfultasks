import { Hono, type Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { z } from 'zod'
import { db, one } from '../db.ts'
import { env } from '../env.ts'
import {
  createSession,
  destroySession,
  getSessionUser,
  hashPassword,
  newUserId,
  SESSION_COOKIE,
  verifyPassword,
} from '../auth.ts'
import type { AppEnv } from '../middleware.ts'

const credentials = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
})

function setSessionCookie(c: Context<AppEnv>, token: string): void {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: env.isProd,
    path: '/',
    maxAge: env.sessionTtlDays * 24 * 60 * 60,
  })
}

export const authRoutes = new Hono<AppEnv>()

authRoutes.post('/register', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = credentials.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, 400)
  }
  const { email, password } = parsed.data

  const existing = await db.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: [email],
  })
  if (existing.rows.length > 0) {
    return c.json({ error: 'An account with that email already exists' }, 409)
  }

  const id = newUserId()
  await db.execute({
    sql: 'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
    args: [id, email, hashPassword(password)],
  })

  setSessionCookie(c, await createSession(id))
  return c.json({ user: { id, email } }, 201)
})

authRoutes.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = credentials.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Invalid email or password' }, 400)
  }
  const { email, password } = parsed.data

  const result = await db.execute({
    sql: 'SELECT id, email, password_hash FROM users WHERE email = ?',
    args: [email],
  })
  const user = one<{ id: string; email: string; password_hash: string }>(
    result.rows,
  )

  if (!user || !verifyPassword(password, user.password_hash)) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  setSessionCookie(c, await createSession(user.id))
  return c.json({ user: { id: user.id, email: user.email } })
})

authRoutes.post('/logout', async (c) => {
  await destroySession(getCookie(c, SESSION_COOKIE))
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  return c.json({ ok: true })
})

authRoutes.get('/me', async (c) => {
  const user = await getSessionUser(getCookie(c, SESSION_COOKIE))
  if (!user) return c.json({ user: null })
  return c.json({ user })
})
