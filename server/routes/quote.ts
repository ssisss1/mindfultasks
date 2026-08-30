import { Hono } from 'hono'
import { randomFallbackQuote } from '../lib/quotes.ts'
import type { AppEnv } from '../middleware.ts'

/**
 * Proxies a keyless external quote API (ZenQuotes) so the browser never talks to
 * a third party directly. Responses are cached briefly to respect rate limits,
 * and any failure falls back to a bundled list so this endpoint never errors.
 *
 * For a keyed provider, read the key from an env var here and add it to the
 * request — it stays server-side and never reaches the client.
 */
export const quoteRoutes = new Hono<AppEnv>()

interface Quote {
  text: string
  author: string
  source: 'zenquotes' | 'fallback'
}

const CACHE_MS = 10 * 60 * 1000
let cache: { quote: Quote; at: number } | null = null

async function fetchExternalQuote(): Promise<Quote | null> {
  try {
    const res = await fetch('https://zenquotes.io/api/random', {
      signal: AbortSignal.timeout(4000),
      headers: { accept: 'application/json' },
    })
    if (!res.ok) return null
    const data = (await res.json()) as Array<{ q?: string; a?: string }>
    const first = data?.[0]
    if (!first?.q) return null
    return { text: first.q.trim(), author: (first.a ?? 'Unknown').trim(), source: 'zenquotes' }
  } catch {
    return null
  }
}

quoteRoutes.get('/', async (c) => {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return c.json(cache.quote)
  }
  const external = await fetchExternalQuote()
  const quote: Quote = external ?? { ...randomFallbackQuote(), source: 'fallback' }
  if (external) cache = { quote, at: Date.now() }
  return c.json(quote)
})
