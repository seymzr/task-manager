import { useState } from 'react'
import { EmptyState } from './components/EmptyState'
import { ErrorBanner } from './components/ErrorBanner'
import { FilterBar } from './components/FilterBar'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { useTasks } from './hooks/useTasks'
import type { Task } from './types'

type SortKey = 'created_desc' | 'created_asc' | 'due_asc' | 'due_desc'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'created_desc', label: 'Newest first' },
  { key: 'created_asc', label: 'Oldest first' },
  { key: 'due_asc', label: 'Due date (soonest)' },
  { key: 'due_desc', label: 'Due date (latest)' },
]

// Tasks without a due date always sort last, regardless of direction.
function compareByDue(a: Task, b: Task, direction: 'asc' | 'desc'): number {
  if (!a.due_date && !b.due_date) return 0
  if (!a.due_date) return 1
  if (!b.due_date) return -1
  const cmp = a.due_date.localeCompare(b.due_date)
  return direction === 'asc' ? cmp : -cmp
}

function sortTasks(list: Task[], sort: SortKey): Task[] {
  const copy = [...list]
  switch (sort) {
    case 'created_asc':
      return copy.sort((a, b) => a.created_at.localeCompare(b.created_at))
    case 'due_asc':
      return copy.sort((a, b) => compareByDue(a, b, 'asc'))
    case 'due_desc':
      return copy.sort((a, b) => compareByDue(a, b, 'desc'))
    case 'created_desc':
    default:
      return copy.sort((a, b) => b.created_at.localeCompare(a.created_at))
  }
}

function App() {
  const {
    tasks,
    filter,
    loading,
    error,
    savingIds,
    creating,
    setFilter,
    reload,
    addTask,
    editTask,
    toggleStatus,
    removeTask,
    dismissError,
  } = useTasks()

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('created_desc')

  const query = search.trim().toLowerCase()
  const matchedTasks = query
    ? tasks.filter((task) => task.title.toLowerCase().includes(query))
    : tasks
  const visibleTasks = sortTasks(matchedTasks, sort)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Task Tracker</h1>
          <p className="mt-1 text-sm text-zinc-400">A simple personal to-do list.</p>
        </header>

        <TaskForm onCreate={addTask} busy={creating} />

        <div className="flex flex-col gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title…"
            aria-label="Search tasks by title"
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:border-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          />
          <div className="flex flex-wrap items-center gap-3">
            <FilterBar value={filter} onChange={setFilter} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort tasks"
              className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 focus-visible:border-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="ml-auto text-sm text-zinc-400">
              {visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
        </div>

        {error && (
          <ErrorBanner
            message={error}
            onDismiss={dismissError}
            onRetry={loading ? undefined : reload}
          />
        )}

        <section aria-live="polite" aria-busy={loading}>
          {loading ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-10 text-center text-sm text-zinc-400">
              Loading tasks…
            </div>
          ) : visibleTasks.length === 0 ? (
            query ? (
              <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900 px-4 py-10 text-center text-sm text-zinc-400">
                No tasks match “{search.trim()}”.
              </div>
            ) : (
              <EmptyState filter={filter} />
            )
          ) : (
            <TaskList
              tasks={visibleTasks}
              savingIds={savingIds}
              onToggleStatus={toggleStatus}
              onEdit={editTask}
              onDelete={removeTask}
            />
          )}
        </section>
      </main>
    </div>
  )
}

export default App
