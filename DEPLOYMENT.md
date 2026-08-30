# Deploying MindfulTasks

Version 2 has a server, so **GitHub Pages no longer works**. You need a host that
runs a Node process (or a container). A `Dockerfile` is included and is the
easiest portable option.

The app is one process: it serves the built client and the API on `$PORT`
(default 8787). It needs a **persistent volume** mounted at `/data` (or set
`DATABASE_PATH` elsewhere) or the SQLite database resets on every redeploy.

Required env: `NODE_ENV=production`. `PORT` is usually injected by the host.

---

## Fly.io  (has a free volume allowance)

```bash
# one-time
curl -L https://fly.io/install.sh | sh
fly auth login

# from the repo root
fly launch --no-deploy          # accept the Dockerfile; pick a name/region
fly volumes create data --size 1
# ensure fly.toml has:  [mounts]  source = "data"  destination = "/data"
fly deploy
```

`fly.toml` also needs `[env] NODE_ENV = "production"` and the internal port set
to `8787` (or set `PORT` via `fly secrets`).

---

## Render

1. New → **Web Service** → connect this repo.
2. Runtime: **Docker**. Render reads the `Dockerfile`.
3. Add env var `NODE_ENV=production`.
4. Add a **Disk**: mount path `/data`, size 1 GB. *(Disks require a paid
   instance type; on the free tier the SQLite file is wiped on each deploy —
   fine for a demo, not for real use.)*

---

## Railway

1. New Project → Deploy from repo.
2. It detects the `Dockerfile`.
3. Add a **Volume** mounted at `/data`.
4. Set `NODE_ENV=production`.

---

## Plain VPS / any Node 22.5+ host (no Docker)

```bash
npm ci
npm run build
NODE_ENV=production DATABASE_PATH=/srv/mindfultasks/data.db PORT=8787 npm start
```

Put it behind a reverse proxy (Caddy/nginx) for TLS. Cookies are `Secure` in
production, so HTTPS is required.

---

## Outgrowing SQLite (move to Postgres)

SQLite on one disk is fine for a single instance. For multiple instances or
managed backups:

- Add `DATABASE_URL` + a Postgres client (`pg` / `postgres`).
- Port the `CREATE TABLE`s in `server/schema.ts` (SQLite → Postgres:
  `INTEGER` booleans → `boolean`, `datetime('now')` → `now()`).
- Replace the `db.prepare(...).get/all/run` calls in `server/db.ts` and
  `server/routes/*` — they're simple and centralised.
- Nothing in `src/` changes.

## Supabase alternative

Supabase replaces the server *and* the database, letting the frontend stay a
static SPA. Rough steps: create `todos` / `meditation_sessions` tables with
`user_id` + row-level security (`user_id = auth.uid()`); swap `AuthContext` for
Supabase Auth and the `api.*` calls for Supabase queries; delete `server/`. The
SQL in `server/schema.ts` is a good starting point for the table definitions.

---

## About the old GitHub Pages site

`https://ssisss1.github.io/mindfultasks/` was the v1 build. The Pages workflow
was removed on this branch. Take the Pages site down (repo Settings → Pages), or
leave it until the v2 host is live and then point users at the new URL.
