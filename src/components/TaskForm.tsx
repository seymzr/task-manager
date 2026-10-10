import { useId, useState, type FormEvent } from 'react'
import type { CreateTaskInput } from '../types'

interface Props {
  onCreate: (input: CreateTaskInput) => Promise<boolean>
  busy: boolean
}

const MAX_TITLE = 200

const inputClass =
  'w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:border-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40'
const labelClass = 'text-xs font-semibold text-zinc-300'

export function TaskForm({ onCreate, busy }: Props) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const titleId = useId()
  const dueId = useId()
  const errorId = useId()

  function validate(value: string): string | null {
    const trimmed = value.trim()
    if (trimmed.length === 0) return 'Title is required.'
    if (trimmed.length > MAX_TITLE) return `Title cannot exceed ${MAX_TITLE} characters.`
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const problem = validate(title)
    if (problem) {
      setValidationError(problem)
      return
    }
    setValidationError(null)
    const ok = await onCreate({ title: title.trim(), due_date: dueDate || null })
    if (ok) {
      setTitle('')
      setDueDate('')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
    >
      <div className="flex flex-col items-end gap-3 sm:flex-row">
        <div className="flex w-full flex-1 flex-col gap-1.5">
          <label htmlFor={titleId} className={labelClass}>
            Task title
          </label>
          <input
            id={titleId}
            type="text"
            value={title}
            maxLength={MAX_TITLE + 1}
            placeholder="e.g. Buy groceries"
            onChange={(e) => {
              setTitle(e.target.value)
              if (validationError) setValidationError(null)
            }}
            aria-invalid={validationError ? true : undefined}
            aria-describedby={validationError ? errorId : undefined}
            className={inputClass}
          />
        </div>
        <div className="flex w-full flex-col gap-1.5 sm:w-auto">
          <label htmlFor={dueId} className={labelClass}>
            Due date <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <input
            id={dueId}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {busy ? 'Adding…' : 'Add task'}
        </button>
      </div>
      {validationError && (
        <p id={errorId} role="alert" className="text-sm text-red-400">
          {validationError}
        </p>
      )}
    </form>
  )
}
