// Returns true if a pending task's due date is strictly before today.
// Done tasks are never considered overdue.
export function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === 'done') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(`${dueDate}T00:00:00`)
  return due.getTime() < today.getTime()
}

// Human-friendly created-at label, e.g. "May 8, 2026".
export function formatCreatedAt(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
