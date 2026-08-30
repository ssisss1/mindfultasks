# MindfulTasks

A calm productivity dashboard that pairs a simple todo list with a short
meditation timer. Version 2 adds **user accounts** and **server-side storage**,
so your tasks follow you between devices and browsers.

## What it does

- **Todo list** — capture and track the day's tasks, per account.
- **Meditation timer** — take a short, focused pause; completed sessions are
  logged so you can see a 7-day summary.
- **Daily progress** — a banner showing how much of today you've completed.
- **A thought to sit with** — a calming quote fetched (server-side) from an
  external API, with a bundled fallback.

Everything lives behind a lightweight email + password login. No third-party
auth, no tracking.

## Features

### Accounts
- Register / sign in / sign out (email + password, min 8 chars).
- Passwords hashed with scrypt; sessions are opaque httpOnly cookies.
- Each account's data is fully isolated (enforced server-side).
- On first sign-in, any todos from the old localStorage-only version are
  migrated into your account automatically.

### Todo list
- Add a task, toggle complete / incomplete, delete.
- Live counts for **total**, **active**, **completed**.
- Optimistic UI — changes show instantly and reconcile with the server.

### Meditation
- Durations: **1, 5, 10, 15 minutes**, `MM:SS` countdown, progress ring.
- **Start / Pause / Reset**; a **"Meditation complete"** message at zero.
- Completed sessions are recorded; the dashboard shows sessions + minutes for
  the last 7 days.

## Tech stack

| Layer     | Choice |
| --------- | ------ |
| Frontend  | Vite + React 18 + TypeScript + Tailwind CSS v3 |
| Backend   | Hono (Node) — a small REST API |
| Database  | SQLite via Node's built-in `node:sqlite` |
| Auth      | scrypt password hashing + cookie sessions (`node:crypto`) |
| Validation| zod |
| External  | ZenQuotes (keyless), proxied through the server |

No ORM, no auth SaaS, no bundled secrets.

## Getting started

### Prerequisites
- **Node.js 22.5+** (for `node:sqlite`). Built and tested on Node 24.

### Install and run (development)

```bash
npm install
npm run dev
```

This starts two processes via `concurrently`:
- the API on `http://localhost:8787`
- Vite on `http://localhost:5173` (which proxies `/api` to the API)

Open <http://localhost:5173>, create an account, and you're in.

> For server auto-reload on file changes, run `npm run dev:server:watch`
> in place of the bundled `dev:server`.

### Production build

```bash
npm run build     # type-checks, builds the client to dist/, bundles the server
NODE_ENV=production npm start
```

In production a single Node process serves the built client **and** the API on
`PORT` (default 8787), with an SPA fallback for client routes.

### Configuration

Copy `.env.example` to `.env` to override defaults:

| Variable        | Default                     | Purpose |
| --------------- | --------------------------- | ------- |
| `PORT`          | `8787`                      | Server port |
| `DATABASE_PATH` | `./data/mindfultasks.db`    | SQLite file location |
| `NODE_ENV`      | `development`               | `production` enables static file serving + `Secure` cookies |

## How data is stored

- **Users, sessions, todos, and meditation sessions** live in a SQLite database
  (`DATABASE_PATH`). Schema and migrations are in `server/schema.ts`, applied
  automatically on startup.
- **Auth**: the browser holds only an opaque `mt_session` httpOnly cookie; the
  session record (and its expiry) lives in the database and can be revoked.
- **No `localStorage`** is used for app data anymore, except a one-time read to
  migrate todos from the v1 layout.

To swap SQLite for Postgres (e.g. on a hosted platform), replace the queries in
`server/db.ts` + `server/routes/*` with a Postgres client — the rest of the app
is storage-agnostic. See [DEPLOYMENT.md](DEPLOYMENT.md).

## Project structure

```
server/
  index.ts          # Hono app; serves the API (+ client in production)
  db.ts             # SQLite connection + migration runner
  schema.ts         # ordered migrations
  auth.ts           # password hashing + session helpers
  middleware.ts     # requireAuth
  routes/           # auth, todos, meditation, quote
  lib/quotes.ts     # offline quote fallback
src/
  context/AuthContext.tsx   # session state, register/login/logout
  components/auth/           # sign-in / sign-up screen
  components/                # Dashboard, Todo*, Meditation, QuoteCard, ...
  hooks/useTodos.ts          # server-backed, optimistic
  hooks/useMeditationStats.ts, useQuote.ts
  lib/api.ts                 # fetch wrapper
  lib/migrateLocalTodos.ts   # one-time v1 → account migration
```
