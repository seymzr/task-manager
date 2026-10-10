import type { CreateTaskInput, StatusFilter, Task, UpdateTaskInput } from '../types'

// Thrown for any non-2xx response so the UI can show a readable message.
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    // Network failure / server not reachable.
    throw new ApiError('Could not reach the server. Is the API running?', 0)
  }

  if (!res.ok) {
    const message = await extractErrorMessage(res)
    throw new ApiError(message, res.status)
  }

  // 204 No Content (delete) has no body to parse.
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json()
    return body?.error ?? `Request failed (${res.status})`
  } catch {
    return `Request failed (${res.status})`
  }
}

export function fetchTasks(filter: StatusFilter): Promise<Task[]> {
  const query = filter === 'all' ? '' : `?status=${filter}`
  return request<Task[]>(`/tasks${query}`)
}

export function createTask(input: CreateTaskInput): Promise<Task> {
  return request<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateTask(id: string, patch: UpdateTaskInput): Promise<Task> {
  return request<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export function deleteTask(id: string): Promise<void> {
  return request<void>(`/tasks/${id}`, { method: 'DELETE' })
}
