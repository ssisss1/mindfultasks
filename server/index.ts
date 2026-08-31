import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { env } from './env.ts'
import { initDb } from './db.ts'
import type { AppEnv } from './middleware.ts'
import { authRoutes } from './routes/auth.ts'
import { todoRoutes } from './routes/todos.ts'
import { meditationRoutes } from './routes/meditation.ts'
import { quoteRoutes } from './routes/quote.ts'

const app = new Hono<AppEnv>()

app.use('*', logger())

const api = new Hono<AppEnv>()
api.get('/health', (c) => c.json({ ok: true }))
api.route('/auth', authRoutes)
api.route('/todos', todoRoutes)
api.route('/meditation', meditationRoutes)
api.route('/quote', quoteRoutes)
app.route('/api', api)

app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ error: 'Not found' }, 404)
  }
  return c.text('Not found', 404)
})

// In production the same process serves the built client.
if (env.isProd && existsSync(env.clientDir)) {
  app.use('/assets/*', serveStatic({ root: env.clientDir }))
  app.use('/*', serveStatic({ root: env.clientDir }))
  const indexHtml = existsSync(join(env.clientDir, 'index.html'))
    ? readFileSync(join(env.clientDir, 'index.html'), 'utf8')
    : '<!doctype html><title>MindfulTasks</title>'
  app.get('*', (c) => c.html(indexHtml)) // SPA fallback
}

await initDb()

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`[server] MindfulTasks API on http://localhost:${info.port} (${env.nodeEnv})`)
})
