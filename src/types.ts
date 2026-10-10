export type TaskStatus = 'pending' | 'done'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  due_date: string | null
  created_at: string
}

export type StatusFilter = 'all' | TaskStatus

export interface CreateTaskInput {
  title: string
  status?: TaskStatus
  due_date?: string | null
}

export interface UpdateTaskInput {
  title?: string
  status?: TaskStatus
  due_date?: string | null
}
