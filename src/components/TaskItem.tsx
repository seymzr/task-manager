import { useEffect, useId, useRef, useState } from 'react'
import type { Task, TaskStatus, UpdateTaskInput } from '../types'
import { formatCreatedAt, isOverdue } from '../utils/date'

interface Props {
  task: Task
  saving: boolean
  onToggleStatus: (task: Task) => void
  onEdit: (id: string, patch: UpdateTaskInput) => Promise<boolean>
  onDelete: (id: string) => void
}

const MAX_TITLE = 200

const inputClass =
  'w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:border-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40'
const labelClass = 'text-xs font-semibold text-zinc-300'
const cardClass = 'rounded-xl border border-zinc-800 bg-zinc-900 p-4'

export function TaskItem({ task, saving, onToggleStatus, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [dueDate, setDueDate] = useState(task.due_date ?? '')
  const [validationError, setValidationError] = useState<string | null>(null)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const titleId = useId()
  const statusId = useId()
  const dueId = useId()
  const errorId = useId()

  // Seed the form from the task and focus the title when edit mode opens.
  useEffect(() => {
    if (editing) {
      setTitle(task.title)
      setStatus(task.status)
      setDueDate(task.due_date ?? '')
      setValidationError(null)
      titleInputRef.current?.focus()
    }
  }, [editing, task])

  async function handleSave() {
    const trimmed = title.trim()
    if (trimmed.length === 0) {
      setValidationError('Title is required.')
      return
    }
    if (trimmed.length > MAX_TITLE) {
      setValidationError(`Title cannot exceed ${MAX_TITLE} characters.`)
      return
    }
    const ok = await onEdit(task.id, { title: trimmed, status, due_date: dueDate || null })
    if (ok) setEditing(false)
  }

  function handleDelete() {
    if (window.confirm(`Delete "${task.title}"?`)) onDelete(task.id)
  }

  const overdue = isOverdue(task.due_date, task.status)

  if (editing) {
    return (
      <div className={`${cardClass} flex flex-col gap-3`}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={titleId} className={labelClass}>
            Title
          </label>
          <input
            id={titleId}
            ref={titleInputRef}
            type="text"
            value={title}
            maxLength={MAX_TITLE + 1}
            onChange={(e) => {
              setTitle(e.target.value)
              if (validationError) setValidationError(null)
            }}
            aria-invalid={validationError ? true : undefined}
            aria-describedby={validationError ? errorId : undefined}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor={statusId} className={labelClass}>
              Status
            </label>
            <select
              id={statusId}
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className={inputClass}
            >
              <option value="pending">Pending</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor={dueId} className={labelClass}>
              Due date
            </label>
            <input
              id={dueId}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        {validationError && (
          <p id={errorId} role="alert" className="text-sm text-red-400">
            {validationError}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={saving}
            className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${cardClass} flex flex-col items-start gap-3 sm:flex-row sm:items-start ${
        saving ? 'opacity-60' : ''
      }`}
    >
      <div
        role="group"
        aria-label={`Status for "${task.title}"`}
        className="inline-flex shrink-0 rounded-md border border-zinc-700 bg-zinc-900 p-0.5"
      >
        <button
          type="button"
          aria-pressed={task.status === 'pending'}
          disabled={saving}
          onClick={() => {
            if (task.status !== 'pending') onToggleStatus(task)
          }}
          className={
            'rounded px-2.5 py-1 text-xs font-semibold transition-colors ' +
            (task.status === 'pending'
              ? 'bg-zinc-700 text-zinc-50'
              : 'text-zinc-400 hover:text-zinc-100')
          }
        >
          Pending
        </button>
        <button
          type="button"
          aria-pressed={task.status === 'done'}
          disabled={saving}
          onClick={() => {
            if (task.status !== 'done') onToggleStatus(task)
          }}
          className={
            'rounded px-2.5 py-1 text-xs font-semibold transition-colors ' +
            (task.status === 'done'
              ? 'bg-emerald-600 text-white'
              : 'text-zinc-400 hover:text-zinc-100')
          }
        >
          Done
        </button>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-1 sm:flex-1">
        <span
          className={
            task.status === 'done'
              ? 'break-words text-sm text-zinc-500 line-through'
              : 'break-words text-sm text-zinc-100'
          }
        >
          {task.title}
        </span>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
          <span>Created {formatCreatedAt(task.created_at)}</span>
          {task.due_date && (
            <span className={overdue ? 'font-semibold text-red-400' : undefined}>
              Due {task.due_date}
              {overdue && ' · overdue'}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {saving && <span className="text-xs text-zinc-500">Saving…</span>}
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={saving}
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving}
          className="rounded-md border border-red-900/60 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-950/60 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
