import { EmptyState } from './components/EmptyState'
import { ErrorBanner } from './components/ErrorBanner'
import { FilterBar } from './components/FilterBar'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { useTasks } from './hooks/useTasks'

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Task Tracker</h1>
          <p className="mt-1 text-sm text-zinc-400">A simple personal to-do list.</p>
        </header>

        <TaskForm onCreate={addTask} busy={creating} />

        <div className="flex items-center justify-between gap-4">
          <FilterBar value={filter} onChange={setFilter} />
          <span className="text-sm text-zinc-400">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
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
          ) : tasks.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <TaskList
              tasks={tasks}
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
