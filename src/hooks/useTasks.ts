import { useCallback, useEffect, useState } from 'react'
import * as api from '../api/tasks'
import { ApiError } from '../api/tasks'
import type { CreateTaskInput, StatusFilter, Task, UpdateTaskInput } from '../types'

function messageFor(err: unknown): string {
  if (err instanceof ApiError) return err.message
  return 'Something went wrong. Please try again.'
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Per-row in-flight tracking, so each task can show its own "saving" state
  // and disable its own controls without freezing the whole list.
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const [creating, setCreating] = useState(false)

  const setSaving = useCallback((id: string, on: boolean) => {
    setSavingIds((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const load = useCallback(async (which: StatusFilter) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.fetchTasks(which)
      setTasks(data)
    } catch (err) {
      setError(messageFor(err))
    } finally {
      setLoading(false)
    }
  }, [])

  // Load on mount and whenever the filter changes (server-side filtering).
  useEffect(() => {
    load(filter)
  }, [filter, load])

  const addTask = useCallback(
    async (input: CreateTaskInput): Promise<boolean> => {
      setCreating(true)
      setError(null)
      try {
        await api.createTask(input)
        await load(filter)
        return true
      } catch (err) {
        setError(messageFor(err))
        return false
      } finally {
        setCreating(false)
      }
    },
    [filter, load],
  )

  const editTask = useCallback(
    async (id: string, patch: UpdateTaskInput): Promise<boolean> => {
      setSaving(id, true)
      setError(null)
      try {
        await api.updateTask(id, patch)
        await load(filter)
        return true
      } catch (err) {
        setError(messageFor(err))
        return false
      } finally {
        setSaving(id, false)
      }
    },
    [filter, load, setSaving],
  )

  // The one optimistic action: flip status locally for instant feedback,
  // then confirm with the server and roll back if it fails.
  const toggleStatus = useCallback(
    async (task: Task) => {
      const nextStatus = task.status === 'done' ? 'pending' : 'done'
      const previous = tasks
      setError(null)
      setSaving(task.id, true)
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)),
      )
      try {
        await api.updateTask(task.id, { status: nextStatus })
        // If a status filter is active, the toggled task may no longer belong
        // in the current view - refetch to reflect that.
        if (filter !== 'all') await load(filter)
      } catch (err) {
        setTasks(previous) // rollback
        setError(messageFor(err))
      } finally {
        setSaving(task.id, false)
      }
    },
    [tasks, filter, load, setSaving],
  )

  const removeTask = useCallback(
    async (id: string) => {
      setSaving(id, true)
      setError(null)
      try {
        await api.deleteTask(id)
        await load(filter)
      } catch (err) {
        setError(messageFor(err))
      } finally {
        setSaving(id, false)
      }
    },
    [filter, load, setSaving],
  )

  return {
    tasks,
    filter,
    loading,
    error,
    savingIds,
    creating,
    setFilter,
    reload: () => load(filter),
    addTask,
    editTask,
    toggleStatus,
    removeTask,
    dismissError: () => setError(null),
  }
}
