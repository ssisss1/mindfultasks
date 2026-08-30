# Deploying MindfulTasks

Version 2 has a server, so **plain GitHub Pages no longer works**. You need a
host that can run a Node process. Two supported paths:

---

## Option A — Single Node host (recommended, matches this repo)

One process serves the built client and the API.

**Hosts:** Render, Railway, Fly.io, a small VPS — anything that runs Node 22.5+.

1. Build command: `npm ci && npm run build`
2. Start command: `npm start`
3. Environment:
   - `NODE_ENV=production`
   - `PORT` — usually injected by the host
   - `DATABASE_PATH=/data/mindfultasks.db` — point at a **persistent disk**, or
     SQLite data is lost on every redeploy/restart.
4. Attach a persistent volume mounted where `DATABASE_PATH` points.

Cookies are set `Secure` automatically when `NODE_ENV=production`, so the site
must be served over HTTPS (all the hosts above do this by default).

### Outgrowing SQLite

SQLite on one disk is fine for a single instance. If you need multiple instances
or managed backups, move to Postgres:

- Add `DATABASE_URL` and a Postgres client (`pg` / `postgres`).
- Port the table creation in `server/schema.ts` (SQLite → Postgres types:
  `INTEGER` booleans → `boolean`, `datetime('now')` → `now()`).
- Replace the `db.prepare(...).get/all/run` calls in `server/db.ts` and
  `server/routes/*`. Query shapes are simple and centralised.
- Nothing in `src/` changes.

---

## Option B — Supabase (managed Postgres + Auth)

If you'd rather not run auth or a database yourself, Supabase replaces both and
the frontend can stay a static SPA (deployable on Netlify/Vercel, or still a
Node host).

Rough shape of the change:

1. Create a Supabase project; create `todos` and `meditation_sessions` tables
   with `user_id uuid references auth.users`, and **row-level security**
   policies of `user_id = auth.uid()`.
2. `npm i @supabase/supabase-js`; init a client from `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY`.
3. Replace `src/context/AuthContext.tsx` with Supabase Auth
   (`signInWithPassword`, `onAuthStateChange`).
4. Replace the `api.*` calls in `src/hooks/useTodos.ts`,
   `useMeditationStats.ts` with Supabase queries.
5. The quote proxy (`server/routes/quote.ts`) becomes a Supabase Edge Function
   (only needed if you later use a keyed quote provider).
6. Delete the `server/` directory and the `dev:server` / `build:server` scripts.

The `server/schema.ts` SQL is a good starting point for the Supabase table
definitions.

---

## Note on `main`

`main` still has `.github/workflows/deploy.yml` (GitHub Pages) and
`base: '/mindfultasks/'` in `vite.config.ts` from v1. When this branch merges,
that workflow should be removed and replaced with a deploy to whichever host is
chosen above. `vite.config.ts` here already sets `base: '/'`.
