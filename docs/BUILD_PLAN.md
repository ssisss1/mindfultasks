# MindfulTasks V1 — Build Plan

Derived from the product brief. This plan builds on the **already-deployed app**
(auth, basic todos, meditation timer, Turso DB, Render deploy all working). V1 is
a **delta**, not a greenfield build.

---

## Current state vs. V1 target

| Capability | Now | V1 needs |
|---|---|---|
| Accounts, sessions, per-user isolation | done | verify only |
| Todo: add / complete / delete | done | verify only |
| Todo: **priority** | — | build |
| Todo: **due date** | — | build |
| Todo: **edit** (change title/priority/date after creation) | — | build |
| Todo: **sensible ordering** (by due date + priority) | newest-first only | build |
| Meditation: duration + countdown + start/pause/reset | done | verify only |
| Meditation: **guided breathing pattern + visual pacer** | silent timer only | build |
| Responsive single-page dashboard | done | re-verify with new UI |

## Scope reconciliation — decide before starting

Two existing features sit *outside* the brief's "does NOT do" list.

| Feature | Status | Recommendation |
|---|---|---|
| "1 session · 10 min in the last 7 days" meditation stat | built | **Cut the UI line.** Brief excludes "progress tracking, analytics, streaks." Keep the DB logging for later. |
| "A thought to sit with" quote card | built | **Keep.** Decoration, not personalization/AI. Cut it if you want a purist V1. |
| "Today's progress — 2 of 4 tasks completed" banner | built | **Keep.** Live view of the current list, not tracking over time. Not a violation. |

Everything else in the brief's "does NOT do" list stays out: no AI, no reflections,
no notifications/reminders (due dates are *displayed*, never pushed), no
recurring/subtasks/tags/projects, no natural-language dates (plain date picker),
no calendar sync, no integrations/import, no native app, no configurable sort.

---

## 1. Project structure

No new top-level structure. Files touched (T) or new (N):

```
server/
  schema.ts            T  migration 002: add priority, due_date to todos
  routes/todos.ts      T  accept + return + validate priority/due_date
  routes/meditation.ts    (unchanged; stat UI removed client-side)
  smoke.mjs            N  plain-node API smoke test (see section 8)
src/
  types.ts             T  Todo: + priority, + dueDate
  lib/api.ts              (unchanged)
  hooks/useTodos.ts    T  new fields in optimistic updates + client-side sort
  hooks/useBreathing.ts N  breathing-phase state machine
  components/
    TodoInput.tsx      T  priority select + date input
    TodoItem.tsx       T  priority dot, due-date badge, edit toggle
    TodoEditForm.tsx   N  inline edit (title/priority/date)
    TodoSection.tsx    T  apply sort, dim completed
    MeditationSection.tsx  T  pattern picker + mount BreathingGuide
    BreathingGuide.tsx  N  animated circle + phase cue text
    Dashboard.tsx      T  remove weekly-stat line
```

## 2. Main screens / components

- **Auth screen** — email + password, login / register toggle. *(exists)*
- **Dashboard** (single route, gated by auth):
  - Header: app name, signed-in email, Sign out
  - Progress banner: % of current list completed *(exists)*
  - **Todo panel**: add form -> list -> per-item row
  - **Meditation panel**: pattern picker -> duration picker -> breathing guide -> controls
  - Footer: "signed in as... / saved to your account"

## 3. Core features

### Feature 1 — Task priority

- **Build:** `priority` column (`'low' | 'medium' | 'high' | null`); zod enum on
  create/update; a 3-option selector in the add form and edit form; a small
  coloured dot on each row (grey none / blue low / amber medium / red high).
- **User can:** set a priority when adding a task, change it later, or leave it unset.
- **Verify:** `POST /api/todos {title, priority:"high"}` -> row persists with
  `priority:"high"`; reload -> dot still shows; `PATCH` to `"low"` and to `null`
  both persist; invalid value (`"urgent"`) -> `400`.

### Feature 2 — Task due date

- **Build:** `due_date` column (`YYYY-MM-DD` string or null); zod date-format
  validation; native `<input type="date">` in add + edit forms; a date badge on
  the row; **overdue** (date < today, task not complete) -> red badge.
- **User can:** attach a due date, change it, clear it; see at a glance which
  tasks are overdue.
- **Verify:** create a task due yesterday -> badge is red; due next week -> badge
  neutral; complete an overdue task -> red styling drops; clear the date -> badge
  disappears; bad format (`"2026-13-40"`) -> `400`.

### Feature 3 — Task ordering

- **Build:** client-side sort in `useTodos` (or `TodoSection`). One fixed order:
  1. incomplete before complete
  2. within incomplete: overdue first, then earliest due date, then no-date
  3. tie-break: higher priority first
  4. final tie-break: newest first

  Completed tasks render dimmed at the bottom.
- **User can:** open the list and see the most urgent thing first without
  configuring anything.
- **Verify:** seed 5 tasks (mix of dates/priorities/completed) and assert the
  rendered order matches the rule; completing the top task moves it to the bottom.

### Feature 4 — Edit a task

- **Build:** an "Edit" affordance on each row that swaps the row for
  `TodoEditForm` (title + priority + due date + Save/Cancel). `PATCH
  /api/todos/:id` already exists — extend its zod schema to accept `priority`
  and `dueDate`, including explicit `null` to clear.
- **User can:** fix a typo, reprioritise, or move a due date without deleting and
  recreating.
- **Verify:** edit title -> persists across reload; edit priority + date in one
  save -> both persist; Cancel -> no change; edit another user's task id -> `404`.

### Feature 5 — Guided breathing

- **Build:**
  - `useBreathing` hook: given a pattern (array of `{phase, seconds}`, e.g. Box =
    `in 4 / hold 4 / out 4 / hold 4`; Calm = `in 4 / out 6`) and a total
    duration, it emits the current phase, seconds left in phase, and overall time
    left; respects pause/reset.
  - `BreathingGuide`: a circle that scales up on inhale, holds, scales down on
    exhale (CSS transition driven by phase), with a text cue ("Breathe in" /
    "Hold" / "Breathe out").
  - `MeditationSection`: add a **2-option** pattern picker (Box, Calm). Keep the
    existing 1/5/10/15 duration picker and Start/Pause/Reset. No audio.
- **User can:** pick a breathing pattern and a length, press Start, and follow
  the expanding/contracting circle for the full duration; pause and resume;
  reset; see a "Meditation complete" message at the end.
- **Verify:** select Box + 1 min, Start -> circle animates on a 4-4-4-4 cycle,
  cue text matches the phase; Pause freezes the circle and the clock; Reset
  returns to full time and idle; run to 0:00 -> "Meditation complete" shows and a
  `POST /api/meditation/sessions` fires exactly once.

### Existing features — regression only

Accounts, basic todo CRUD, localStorage->account migration, meditation timer,
quote card: confirm still pass after the changes (see section 8).

## 4. Data / state requirements

**Database (libSQL/Turso) — migration `002_task_fields`:**

```sql
ALTER TABLE todos ADD COLUMN priority TEXT;   -- 'low' | 'medium' | 'high' | NULL
ALTER TABLE todos ADD COLUMN due_date TEXT;   -- 'YYYY-MM-DD' | NULL
```

Additive, nullable, no backfill -> safe on the live DB with zero downtime.

Full `todos` row after migration:
`id, user_id, title, completed, priority, due_date, created_at, updated_at`.
Other tables unchanged: `users`, `sessions`, `meditation_sessions`.

**Client state:**
- Session/user -> `AuthContext` (backed by the httpOnly cookie; never in
  JS-readable storage).
- Todo list -> `useTodos` React state, optimistic on add/toggle/delete/edit,
  reconciled from API responses.
- Breathing/timer -> component-local state; **not persisted** (resets on reload —
  intentional).
- No `localStorage` for app data except the one-time v1 migration read.

## 5. Backend / API requirements

Same Hono service. Endpoint changes:

| Endpoint | Change |
|---|---|
| `POST /api/todos` | body: `{ title, priority?, dueDate? }` — zod: priority enum, dueDate `YYYY-MM-DD` |
| `PATCH /api/todos/:id` | body may include `priority` and `dueDate`; accept `null` to clear; still ownership-checked |
| `GET /api/todos` | response items include `priority`, `dueDate`; still returns newest-first (client sorts) |
| `/api/meditation/*`, `/api/quote`, `/api/auth/*` | unchanged |

No new endpoints. No new env vars. No new dependencies (date input is native;
animation is CSS).

## 6. Recommended technology stack

Keep exactly what's deployed — it fits V1 with no additions:

| Layer | Tool | Note |
|---|---|---|
| UI | Vite + React 18 + TypeScript | — |
| Styling | Tailwind CSS v3 | — |
| API | Hono on Node | — |
| DB | libSQL (`@libsql/client`) — local file in dev, Turso in prod | migration runs on startup |
| Auth | scrypt + opaque cookie sessions (`node:crypto`) | — |
| Validation | zod | extend existing schemas |
| Host | Render (Node runtime, free plan, auto-deploy from `main`) | — |

New primitives needed: `<input type="date">`, CSS `transform`/`transition` for
the breathing circle, a small `setInterval` phase machine. Nothing to install.

## 7. Implementation steps (in order)

1. **Migration** — add `002_task_fields` to `server/schema.ts`; run locally,
   confirm columns exist.
2. **Server: todos** — extend zod schemas + `POST`/`PATCH` handlers + row
   serializer for `priority` / `dueDate` (incl. clearing to `null`).
3. **Server smoke test** — add `server/smoke.mjs`; cover the new fields +
   validation errors; green.
4. **Client types + hook** — `Todo` type gains `priority`, `dueDate`; `useTodos`
   sends/receives them and keeps optimistic updates correct.
5. **Add form** — priority select + date input in `TodoInput`.
6. **Edit** — `TodoEditForm` + edit toggle in `TodoItem`; wire to `PATCH`.
7. **Row display** — priority dot, due-date badge, overdue styling, dim completed.
8. **Sort** — implement the fixed ordering; unit-check the comparator.
9. **Breathing hook** — `useBreathing` with the two patterns; pause/reset correct.
10. **Breathing UI** — `BreathingGuide` circle + cues; pattern picker in
    `MeditationSection`; keep logging one session on completion.
11. **Scope trim** — remove the 7-day meditation stat line from `Dashboard`
    (keep server logging).
12. **Regression pass** — run full verification (section 8) on a fresh account.
13. **Docs** — update `README.md` (new fields, breathing patterns).
14. **Deploy** — push to `main`; Render auto-deploys; migration 002 runs on boot;
    smoke-test the live URL.

## 8. Testing / verification

There is no automated test suite today. For V1, add **one plain-Node API
smoke-test script** (`server/smoke.mjs`, no framework) run after every backend
change and before deploy. Not scope creep — the minimum guard for a persisted
multi-user app.

**Smoke script must cover:**
- register -> `/me` -> logout -> `/me` (cookie lifecycle)
- create todo with `priority` + `dueDate` -> `GET` returns them -> `PATCH`
  changes them -> `PATCH` clears them to `null`
- invalid `priority` and invalid `dueDate` -> `400`
- second account sees an empty list; `PATCH`/`DELETE` on the first account's
  todo -> `404`
- unauthenticated `/api/todos` -> `401`
- `POST /api/meditation/sessions` -> `201`
- `GET /api/quote` -> `200`

**Build check:** `npm run build` (tsc typecheck + vite build + server bundle)
exits 0.

**Manual browser pass (fresh account, desktop + 375px mobile):**
- register -> dashboard
- add 3 tasks with different priorities/dates (one overdue) -> order and badges
  correct
- edit one task's priority and date -> persists after full reload
- complete a task -> sinks to bottom, dimmed
- delete a task -> gone after reload
- meditation: Box + 1 min -> circle paces correctly, Pause/Reset work, runs to
  completion -> "Meditation complete"
- sign out -> auth screen; sign back in -> data intact

**Live post-deploy:** repeat the smoke script and one manual flow against the
production URL.

## 9. Deployment requirements

- **Host:** existing Render service, `autoDeploy: true` — push to `main` deploys.
- **Build command:** unchanged (`npm ci --include=dev && npm run build`).
- **DB:** existing Turso database; migration `002` is additive and runs
  automatically on server start — no manual step, no backfill, no downtime.
- **Env vars:** no changes (`DATABASE_URL`, `DATABASE_AUTH_TOKEN`,
  `NODE_ENV=production`, `NODE_VERSION=22.11.0`).
- **Rollback:** if 002 or the deploy misbehaves, revert the commit on `main` and
  redeploy; the added columns are harmless if unused.
- **Post-deploy gate:** smoke script green against the live URL, plus one manual
  signup/add/reload check.

## 10. Definition of DONE

V1 is done when **all** of these are true:

- [ ] Migration 002 applied; `todos` has `priority` and `due_date`.
- [ ] A user can add, edit, complete, and delete tasks, each with an optional
      priority and due date, and all of it survives logout/login and a hard reload.
- [ ] The list is ordered urgency-first with no configuration; overdue incomplete
      tasks are visually flagged; completed tasks are dimmed at the bottom.
- [ ] Meditation mode offers 2 breathing patterns and 4 durations; the visual
      pacer follows the pattern; Start/Pause/Reset behave; completion shows the
      message and logs one session.
- [ ] The 7-day meditation stat line is removed from the UI (per scope).
- [ ] No feature from the brief's "does NOT do" list has been added.
- [ ] `npm run build` passes; the API smoke script passes locally and against
      production.
- [ ] Deployed to the production URL and verified live.
- [ ] `README.md` reflects the new fields and breathing patterns.

**DONE does not mean validated.** It means the V1 scope is built, tested, and
shipped. Whether anyone wants a combined todo + breathing app — the riskiest
assumption from the brief — is a separate question that shipping this does not
answer. Put the live URL in front of real target users and watch what they do
before building anything from the "future" list.
