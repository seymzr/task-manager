export type TaskStatus = 'pending' | 'done'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  due_date: string | null
  created_at: string
}
