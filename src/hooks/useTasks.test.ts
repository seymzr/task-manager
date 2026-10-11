import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../api/tasks'
import { ApiError } from '../api/tasks'
import type { Task } from '../types'
import { useTasks } from './useTasks'

// Mock the API module but keep the real ApiError class so the hook's
// instanceof check (which picks the readable message) still works.
vi.mock('../api/tasks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/tasks')>()
  return {
    ...actual,
    fetchTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  }
})

const pendingTask: Task = {
  id: '1',
  title: 'Buy milk',
  status: 'pending',
  due_date: null,
  created_at: '2026-10-10T00:00:00.000Z',
}

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads tasks on mount', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue([pendingTask])

    const { result } = renderHook(() => useTasks())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.tasks).toEqual([pendingTask])
  })

  it('keeps the new status when the server confirms the toggle', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue([pendingTask])
    vi.mocked(api.updateTask).mockResolvedValue({ ...pendingTask, status: 'done' })

    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.toggleStatus(pendingTask)
    })

    expect(api.updateTask).toHaveBeenCalledWith('1', { status: 'done' })
    expect(result.current.tasks[0].status).toBe('done')
    expect(result.current.error).toBeNull()
  })

  it('rolls back the optimistic toggle and surfaces an error on failure', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue([pendingTask])
    vi.mocked(api.updateTask).mockRejectedValue(new ApiError('Could not reach the server.', 0))

    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.toggleStatus(pendingTask)
    })

    // The optimistic flip to "done" is reverted to the original "pending".
    expect(result.current.tasks[0].status).toBe('pending')
    expect(result.current.error).toBe('Could not reach the server.')
  })
})
