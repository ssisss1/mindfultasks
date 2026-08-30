# MindfulTasks

A calm, single-page productivity dashboard that pairs a simple todo list with a
short meditation timer. Plan your day, then take a mindful break — all in one
quiet, distraction-free space.

## What it does

MindfulTasks combines two small tools on one responsive dashboard:

- A **todo list** for capturing and tracking the day's tasks.
- A **meditation timer** for taking a short, focused pause.

A progress banner at the top shows how much of today you've completed at a
glance. Everything is stored locally in your browser — no account, no server.

## Features

### Todo list
- Add a task with a title.
- Mark tasks complete / incomplete.
- Delete tasks.
- Live counts for **total**, **active**, and **completed** tasks.
- Tasks persist in `localStorage`, so they survive a page refresh.

### Meditation
- Selectable durations: **1, 5, 10, and 15 minutes**.
- Clear `MM:SS` countdown with a circular progress ring.
- **Start**, **Pause**, and **Reset** controls.
- Shows a **"Meditation complete"** message when the timer finishes.
- No audio, no external APIs.

### Dashboard
- Single-page layout combining both sections in terminal-style panels.
- "Today's progress" banner highlighting task completion.
- Responsive for desktop and mobile.

### Theme
- 1980s CRT / phosphor-terminal aesthetic: dark screen, monospace type
  (IBM Plex Mono + VT323), green/amber accents, scanline and glow effects.
- Purely visual — all functionality and data handling are unchanged.
- CRT flicker and scanline drift respect `prefers-reduced-motion`.

## Tech stack

- [Vite](https://vite.dev/) — build tool and dev server
- [React 18](https://react.dev/) — UI library
- [TypeScript](https://www.typescriptlang.org/) — typing
- [Tailwind CSS v3](https://tailwindcss.com/) — styling
- Google Fonts (IBM Plex Mono, VT323) — terminal typography
- Browser `localStorage` — persistence

## Getting started

### Prerequisites
- Node.js 18+ and npm

### Install and run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default: <http://localhost:5173>).

### Other scripts

```bash
npm run build     # type-check and produce a production build in dist/
npm run preview   # serve the production build locally
```

## How data is stored

All data lives in the browser's `localStorage` — there is no backend, database,
or authentication.

- **Todos** are saved under the key `mindfultasks.todos` as a JSON array. They
  are written on every change and re-read when the app loads, so they persist
  across refreshes and browser restarts on the same device/browser.
- **Meditation timer** state (selected duration, remaining time, running/paused)
  is kept in React component state only and resets when the page reloads.

Clearing your browser storage for this site will remove all saved todos.

## Project structure

```
src/
  components/
    Card.tsx              # Reusable panel wrapper
    Dashboard.tsx         # Top-level layout, owns todo state
    MeditationSection.tsx # Timer UI + controls
    ProgressBanner.tsx    # "Today's progress" hero
    StatCard.tsx          # Small stat tile (total/active/done)
    TodoInput.tsx         # Add-task form
    TodoItem.tsx          # Single todo row
    TodoSection.tsx       # Todo card: stats + input + list
  hooks/
    useLocalStorage.ts    # Generic state <-> localStorage sync
    useTodos.ts           # Todo CRUD + derived counts
    useMeditationTimer.ts # Countdown logic and controls
  types.ts
  App.tsx
  main.tsx
```
