import type { StatusFilter } from '../types'

interface Props {
  value: StatusFilter
  onChange: (filter: StatusFilter) => void
}

const OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'done', label: 'Done' },
]

export function FilterBar({ value, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Filter tasks by status"
      className="inline-flex rounded-lg border border-zinc-700 bg-zinc-900 p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = value === option.key
        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.key)}
            className={
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ' +
              (active
                ? 'bg-zinc-700 text-zinc-50'
                : 'text-zinc-400 hover:text-zinc-100')
            }
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
