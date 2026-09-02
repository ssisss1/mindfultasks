# MindfulTasks — Japandi prototype (v2)

A standalone, isolated visual prototype of the MindfulTasks **Today** dashboard
in a Japandi aesthetic. Built for side-by-side comparison with the production
React app — it is **not** part of that app and shares no code with it.

## What it is

The same dashboard experience as [`../dashboard.html`](../dashboard.html),
split into separate files:

| File | Purpose |
|------|---------|
| `index.html` | Markup / page structure |
| `styles.css` | Japandi design system + component styles |
| `app.js` | Task state, interactions, and the breathing-pause flow |
| `README.md` | This file |

`../dashboard.html` is the visual reference; `../../docs/BUILD_PLAN.md` and the
original build spec are the functional reference.

## How to run it

**Option A — open directly:** double-click `index.html` (or open it in a
browser). Everything works offline except the web fonts.

**Option B — serve the folder** (recommended; the native date picker and fonts
behave most consistently over HTTP):

```bash
npx serve prototype/japandi-v2
# or
python -m http.server 8000 --directory prototype/japandi-v2
```

Then open the printed URL.

## What you can do

- **Tasks** — add, complete / un-complete. Tap a priority dot to cycle
  none → low → medium → high. Tap a due date to pick one (relative labels:
  Today / Tomorrow / weekday / date; a past date reads in clay). The list
  sorts urgency-first (overdue → soonest due → higher priority).
- **Progress** — the bead row and "X of Y done" update live.
- **Guided breathing** — pick 1 / 3 / 5 minutes, press **Begin** (or tap the
  ring). The screen gives way to a single orb pacing the breath
  (in 4s · out 6s · rest 2s) with a phase cue and countdown. Ends on its own,
  on **End**, or on Escape, and returns focus to where you were.

## Data & isolation

- **In-memory only.** No `fetch`, no `localStorage`, no API. Reloading the page
  resets to the seeded day.
- **Not connected to Turso, Supabase, the production API, or any backend.**
- Lives entirely under `prototype/japandi-v2/`. The production build
  (`vite`, `src/`, `server/`) does not see this directory.

## Known gaps vs. the build plan

Matches `../dashboard.html` exactly, so it also omits: deleting a task, editing
a task title, and a second breathing pattern. Those are in
`../../docs/BUILD_PLAN.md` and can be added here if wanted.
