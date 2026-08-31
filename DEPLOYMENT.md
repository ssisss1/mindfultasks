# Deploying MindfulTasks

v2 needs a Node host **and** a database. The database is
[libSQL / Turso](https://turso.tech) — a hosted SQLite with a free, no-card
tier. Locally, the same code uses a plain SQLite file (`./data/mindfultasks.db`).

The server is one process: it serves the built client and the API on `$PORT`.

---

## 1. Create the database (Turso — free, no card)

Web dashboard (<https://turso.tech>) or CLI:

```bash
# install: curl -sSfL https://get.tur.so/install.sh | bash
turso auth signup
turso db create mindfultasks
turso db show mindfultasks --url           # -> DATABASE_URL  (libsql://...)
turso db tokens create mindfultasks        # -> DATABASE_AUTH_TOKEN
```

You don't need to create tables — the server runs its migrations on startup.

## 2. Deploy the server

### Render (free, no card) — `render.yaml` included

1. <https://dashboard.render.com> → **New → Blueprint** → pick this repo.
2. It reads `render.yaml` (Node runtime, `npm ci && npm run build`, `npm start`).
3. Set the two secret env vars in the dashboard:
   - `DATABASE_URL` = the `libsql://…` URL from step 1
   - `DATABASE_AUTH_TOKEN` = the token from step 1
4. Deploy. Health check is `/api/health`.

> Render's free web service sleeps after ~15 min idle and cold-starts on the
> next request (a few seconds). Data is safe — it's in Turso, not on the box.

### Any Docker host — `Dockerfile` included

`docker build -t mindfultasks . && docker run -p 8787:8787 \
  -e NODE_ENV=production -e DATABASE_URL=... -e DATABASE_AUTH_TOKEN=... mindfultasks`

Works on Fly.io, Railway, Koyeb, a VPS, etc.

### Plain Node host

```bash
npm ci && npm run build
NODE_ENV=production DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm start
```

Serve behind HTTPS — session cookies are `Secure` in production.

---

## Config reference

| Variable              | Default (dev)                  | Notes |
| --------------------- | ------------------------------ | ----- |
| `PORT`                | `8787`                         | Injected by most hosts |
| `NODE_ENV`            | `development`                  | `production` = static serving + `Secure` cookies |
| `DATABASE_URL`        | `file:./data/mindfultasks.db`  | `libsql://<db>.turso.io` in prod |
| `DATABASE_AUTH_TOKEN` | *(none)*                       | Required for a remote Turso URL |

## Swapping the database

The DB layer is `@libsql/client` behind `server/db.ts` (`export const db`,
plus `one` / `many` row helpers). It already speaks the libSQL protocol, so any
libSQL-compatible target works by changing env vars only. For plain Postgres,
replace `server/db.ts` and the `db.execute(...)` calls in `server/routes/*` —
they're centralised and simple.

## The old GitHub Pages site

`https://ssisss1.github.io/mindfultasks/` is the v1 build. Its workflow was
removed. Take it down (repo Settings → Pages) once the v2 host is live.
