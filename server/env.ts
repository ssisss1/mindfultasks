import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(here, '..')

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 8787),
  /** SQLite file location. Point at a persistent disk in production. */
  databasePath:
    process.env.DATABASE_PATH ?? resolve(projectRoot, 'data', 'mindfultasks.db'),
  /** Where the built client lives; served statically in production. */
  clientDir: resolve(projectRoot, 'dist'),
  /** Session lifetime. */
  sessionTtlDays: 30,
}
