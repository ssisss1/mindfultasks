# MindfulTasks — Todo list + meditation timer dashboard

## Summary

MindfulTasks is a calm, single-page productivity dashboard that combines a
simple todo list with a short guided-pause meditation timer. The goal is a
focused MVP: capture the day's tasks, see progress at a glance, and take a
mindful break — all client-side, with no account or backend.

This PR implements the full application on top of the project scaffold.

- **Base branch:** `main` (Vite + React + TS + Tailwind scaffold)
- **This branch:** `feature/mindfultasks-mvp`

## Main features implemented

### Todo list
- Add a task by title (form + "Add" button, empty input is ignored)
- Toggle tasks complete / incomplete
- Delete tasks
- Live counts for **total**, **active**, and **completed**
- Persisted to `localStorage` under `mindfultasks.todos` — tasks survive a
  refresh and browser restart

### Meditation
- Selectable durations: **1, 5, 10, 15 minutes**
- Clear `MM:SS` countdown with a circular progress ring
- **Start**, **Pause**, **Reset** controls (buttons disable when not applicable)
- **"Meditation complete"** message shown when the countdown reaches zero
- No audio, no external APIs

### Dashboard
- Single page combining both sections in card panels
- Prominent **"Today's progress"** banner (percentage, progress bar, remaining
  task count)
- Responsive layout: two columns on desktop, stacked on mobile

## Tech stack

| Concern      | Choice                        |
| ------------ | ----------------------------- |
| Build tool   | Vite 5                        |
| UI           | React 18                      |
| Language     | TypeScript 5 (strict)         |
| Styling      | Tailwind CSS v3               |
| Persistence  | Browser `localStorage` only   |

No database, authentication, payments, or external services.

## How it was tested

- **Production build:** `npm run build` (runs `tsc -b` then `vite build`)
  completes with no type or build errors.
- **Manual testing** in the browser against the dev server:
  - Added multiple tasks; verified total/active/completed counts and the
    progress banner update correctly.
  - Toggled tasks complete/incomplete and deleted tasks.
  - Reloaded the page and confirmed tasks persist from `localStorage`.
  - Ran the meditation timer end-to-end on the 1-minute setting and confirmed
    the countdown, progress ring, Pause/Reset behaviour, and the
    "Meditation complete" message at 00:00.
  - Checked the responsive layout at mobile (375px) and desktop widths.

## Screenshot

![MindfulTasks dashboard](docs/screenshot.png)
