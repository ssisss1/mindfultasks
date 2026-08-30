# MindfulTasks v2 — accounts, backend & database

## Summary

Turns MindfulTasks from a static localStorage SPA into a small multi-user
web app: email/password accounts, a REST API, and server-side storage. The
todo list and meditation timer behave the same for the user — they're just
backed by an account now instead of the browser.

- **Base branch:** `main` (v1, the original calm design — *not* the CRT branch)
- **This branch:** `feature/mindfultasks-backend`

## What's new

### Backend (`server/`)
- **Hono** API on Node.
- **SQLite** via Node's built-in `node:sqlite` (no native modules); schema +
  migrations in `server/schema.ts`, applied on startup.
- **Auth**: register / login / logout; scrypt password hashing and opaque
  httpOnly cookie sessions (both via `node:crypto`), revocable server-side.
- **Routes**: `/api/auth/*`, `/api/todos` (CRUD, per-user), `/api/meditation/*`
  (log a completed session + 7-day stats), `/api/quote` (external API proxy).
- **External API**: `/api/quote` proxies ZenQuotes server-side and caches it,
  with a bundled fallback list so it never hard-fails. Shows where a provider
  key would go.
- Input validation with **zod**; `requireAuth` middleware guards user data.

### Frontend (`src/`)
- `AuthContext` + a sign-in / sign-up screen; the dashboard is gated behind it.
- `useTodos` rewritten to be **server-backed with optimistic updates** — same
  public shape, so `TodoSection` / `TodoItem` / `TodoInput` are barely touched.
- New: `useMeditationStats` (logs a session on timer completion, shows a 7-day
  summary), `useQuote`, `QuoteCard`, `lib/api.ts`.
- **One-time migration**: on first authenticated load, todos from the v1
  `localStorage` key are POSTed into the account, then the key is cleared.
  Made concurrency-safe after testing caught StrictMode double-invoking it.
- `MeditationSection` gains one optional `onSessionComplete` prop; timer logic
  is unchanged.

### Build / deploy
- `npm run dev` runs API + client together (Vite proxies `/api`).
- `npm run build` type-checks, builds the client, **and** bundles the server
  (`esbuild` → `server-dist/`). `npm start` serves both from one process.
- `vite.config.ts` `base` back to `/`; GitHub Pages no longer applies —
  see `DEPLOYMENT.md` (single Node host, or a Supabase swap).

### Removed
- `src/hooks/useLocalStorage.ts` (no longer used).

## How it was tested

**API (curl):** register/login/logout/session, todos CRUD, per-user isolation
(2nd account sees nothing; `404` touching another user's todo), `401` without a
session, meditation logging + stats, `/api/quote` hitting the live API.

**Browser (dev server), full flow:**
- Register → auto-login → dashboard.
- Seeded a v1 `localStorage` list → on first load it migrated into the account
  exactly once (3 todos, order + completed state preserved, key cleared).
- Add / toggle / delete todos; **full page reload → state persists** from the DB.
- Sign out → auth screen; register a 2nd account → **isolated** (empty).
- Ran the 1-min timer to completion → `POST /meditation/sessions` fired once,
  "Meditation complete" shown, 7-day stat updated live.
- Quote card renders from the live external API.

**Build:** `npm run build` passes (client + server). The production bundle
(`NODE_ENV=production npm start`) serves the static client, the API, and the SPA
fallback — all verified.

## Screenshot

![MindfulTasks v2 — signed-in dashboard](docs/screenshot.png)

## Notes
- Not merged, not deployed.
- SQLite file is local/gitignored; pick a host with a persistent disk (or move
  to Postgres/Supabase) per `DEPLOYMENT.md`.
