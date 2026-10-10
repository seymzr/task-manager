import type { Task, UpdateTaskInput } from '../types'
import { TaskItem } from './TaskItem'

interface Props {
  tasks: Task[]
  savingIds: Set<string>
  onToggleStatus: (task: Task) => void
  onEdit: (id: string, patch: UpdateTaskInput) => Promise<boolean>
  onDelete: (id: string) => void
}

export function TaskList({ tasks, savingIds, onToggleStatus, onEdit, onDelete }: Props) {
  return (
    <ul className="flex flex-col gap-2.5">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskItem
            task={task}
            saving={savingIds.has(task.id)}
            onToggleStatus={onToggleStatus}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  )
}
