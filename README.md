# Task Tracker

A small personal task tracker: create, edit, complete, delete, and filter tasks.
React + TypeScript frontend, a minimal Express API, and JSON-file persistence.

## How to run

The app has two parts that run separately. **Start the API first** — the frontend
proxies `/tasks` to it.

**API** (port 3001):

```bash
cd server
npm install
npm run dev
```

**Frontend** (port 5173), from the project root in a second terminal:

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

**Tests** (frontend), from the project root:

```bash
npm test
```

## Technology choices

- **React 18 + TypeScript (Vite).** Vite for a fast dev server; TypeScript so the
  task data model is enforced end to end.
- **Tailwind CSS v4 (plain, dark theme).** Utility-first styling let me build a
  responsive, consistent dark UI quickly. I deliberately avoided a component
  library so every piece of markup is my own and easy to explain.
- **State & data fetching: one custom `useTasks` hook** over the native `fetch`
  API — no data-fetching library. For an app this size, plain React state keeps
  the data flow explicit and the dependency count low.
- **Local API: Express + TypeScript** with a file-based repository. Requests are
  validated with **zod**; malformed JSON and invalid bodies return `400` instead
  of crashing the server.

## Project structure

```
src/                 Frontend
  api/tasks.ts        fetch client + error handling
  hooks/useTasks.ts   all task state + CRUD actions
  components/         UI (form, list, item, filter, states)
  utils/date.ts       overdue / date formatting
  types.ts
server/src/          API
  routes/             Express route handlers
  data/               JSON repository + write queue
  validation/         zod schemas
  index.ts            app wiring + error middleware
server/data/tasks.json  persisted tasks (seeded)
```

## What I'd improve with more time

- **Broader test coverage.** There are Vitest + Testing Library tests for the
  `useTasks` optimistic-toggle/rollback logic and the create-form validation;
  next I'd add a Supertest suite for the API validation and CRUD paths.
- Toast notifications for success feedback (errors currently use an inline banner).
- Search by title and sort by due date (listed nice-to-haves).
- Abort in-flight requests on rapid filter changes; persist the selected filter.

## Assumptions

- **"Mark as done" vs "edit status" (the ambiguity).** The brief lists marking a
  task done separately from editing it, so I provided both: a one-click
  Pending/Done toggle on each row (quick `PATCH`), plus a full inline edit form
  for title, status, and due date together.
- **Concurrency.** A single in-process async queue serializes read-modify-write
  cycles to `tasks.json`. This is correct for one local server process, but not
  safe across multiple processes — acceptable for a local single-user app.
- **IDs** are UUIDs, not auto-incrementing integers, to avoid races with
  file-based storage.
- **`due_date`** is a date-only `YYYY-MM-DD` string (matching the sample). A task
  is "overdue" only if it is pending and its due date is before today; done tasks
  are never flagged.
- The UI is **dark-mode only** by design; single user, no authentication.
