import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { getSessionUser, SESSION_COOKIE, type SessionUser } from './auth.ts'

export type AppEnv = {
  Variables: {
    user: SessionUser
  }
}

/** Rejects the request with 401 unless a valid session cookie is present. */
export async function requireAuth(
  c: Context<AppEnv>,
  next: Next,
): Promise<Response | void> {
  const user = getSessionUser(getCookie(c, SESSION_COOKIE))
  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401)
  }
  c.set('user', user)
  await next()
}
