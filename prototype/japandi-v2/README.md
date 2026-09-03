# MindfulTasks — Japandi prototype (v2)

A standalone Japandi-styled prototype of the MindfulTasks **Today** dashboard,
with **Supabase** for sign-in and per-user task storage. Built as a learning
exercise, separate from the production React app and from
[`../dashboard.html`](../dashboard.html).

| File | Purpose |
|------|---------|
| `index.html` | Page structure + the sign-in / sign-up panel |
| `styles.css` | Japandi design system + auth styles |
| `app.js` | Supabase client, auth flow, task CRUD, the breathing pause |
| `README.md` | This file |

## How it stores data

- **Auth:** Supabase email + password. A logged-in session is kept by
  `supabase-js` in the browser (survives refresh).
- **Tasks:** one row per task in a Postgres table `public.tasks`, each row
  owned by a `user_id`:

  ```
  id | user_id | title | priority | due_date | done | created_at
  ```

- **Isolation:** Row-Level Security. Every query the browser makes is filtered
  by `auth.uid() = user_id`, so a user only ever sees or changes their own
  tasks. The Supabase URL and publishable key are hardcoded in `app.js` — that
  is expected; they are browser keys and RLS is the security boundary. The
  `service_role` key is never used.
- The **breathing pause** is still in-memory only — it is not task data.

## Running it

It must be **served over HTTP** (module imports + auth need a real origin —
opening `index.html` as a `file://` will not work):

```bash
npx serve prototype/japandi-v2
# or
python -m http.server 8000 --directory prototype/japandi-v2
```

Then open the printed URL and create an account.

## One-time Supabase setup (already done for this project)

1. **Table + policies** — applied as the migration `create_tasks_table`
   on project `imhndydivpbqvxrhupox`.
2. **Email confirmation off** — Supabase dashboard →
   *Authentication → Sign In / Providers → Email → uncheck "Confirm email"* —
   so sign-up logs you straight in without an email round-trip.

To point this at a different Supabase project, change `SUPABASE_URL` and
`SUPABASE_KEY` at the top of `app.js` and re-run the migration there.

## Scope

Same features as `../dashboard.html` (add / complete tasks, priority, due
dates + urgency sort, bead progress, guided-breathing pause) — now persisted
per account. Still no task delete or title editing (see
`../../docs/BUILD_PLAN.md`).
