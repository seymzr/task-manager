import type { StatusFilter } from '../types'

interface Props {
  filter: StatusFilter
}

const MESSAGES: Record<StatusFilter, string> = {
  all: 'No tasks yet. Add your first task above.',
  pending: 'No pending tasks. Nice work!',
  done: 'No completed tasks yet.',
}

export function EmptyState({ filter }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900 px-4 py-10 text-center text-sm text-zinc-400">
      {MESSAGES[filter]}
    </div>
  )
}
