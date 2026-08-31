import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto'
import { db, one } from './db.ts'
import { env } from './env.ts'

const SCRYPT_KEYLEN = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN)
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split('$')
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false
  const expected = Buffer.from(hashHex, 'hex')
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), SCRYPT_KEYLEN)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export interface SessionUser {
  id: string
  email: string
}

export async function createSession(userId: string): Promise<string> {
  const token = randomUUID() + randomBytes(24).toString('hex')
  const expiresAt = new Date(
    Date.now() + env.sessionTtlDays * 24 * 60 * 60 * 1000,
  ).toISOString()
  await db.execute({
    sql: 'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
    args: [token, userId, expiresAt],
  })
  return token
}

export async function getSessionUser(
  token: string | undefined,
): Promise<SessionUser | null> {
  if (!token) return null
  const result = await db.execute({
    sql: `SELECT u.id AS id, u.email AS email, s.expires_at AS expiresAt
            FROM sessions s
            JOIN users u ON u.id = s.user_id
           WHERE s.token = ?`,
    args: [token],
  })
  const row = one<{ id: string; email: string; expiresAt: string }>(result.rows)
  if (!row) return null
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    await db.execute({
      sql: 'DELETE FROM sessions WHERE token = ?',
      args: [token],
    })
    return null
  }
  return { id: row.id, email: row.email }
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return
  await db.execute({ sql: 'DELETE FROM sessions WHERE token = ?', args: [token] })
}

export const SESSION_COOKIE = 'mt_session'

export function newUserId(): string {
  return 'usr_' + randomBytes(12).toString('hex')
}
