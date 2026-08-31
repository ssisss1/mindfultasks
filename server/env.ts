import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(here, '..')

const defaultDbFile = resolve(projectRoot, 'data', 'mindfultasks.db')

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 8787),
  /**
   * libSQL / Turso connection.
   * - dev default: a local file (`file:./data/mindfultasks.db`)
   * - production: set DATABASE_URL to a `libsql://<db>.turso.io` URL and
   *   DATABASE_AUTH_TOKEN to its token.
   */
  databaseUrl:
    process.env.DATABASE_URL ??
    `file:${process.env.DATABASE_PATH ?? defaultDbFile}`,
  databaseAuthToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  /** Where the built client lives; served statically in production. */
  clientDir: resolve(projectRoot, 'dist'),
  /** Session lifetime. */
  sessionTtlDays: 30,
}
