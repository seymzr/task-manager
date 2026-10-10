import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Task, TaskStatus } from '../types.js'
import type { CreateTaskInput, UpdateTaskInput } from '../validation/task.schema.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'tasks.json')

/**
 * This is a single Node process writing to a single local file, so a strict
 * in-memory queue is enough to serialize read-modify-write cycles and avoid
 * two concurrent requests clobbering each other's write. It does NOT make
 * writes safe across multiple server processes/instances - that's out of
 * scope for a local single-user take-home (documented in README).
 */
let queue: Promise<unknown> = Promise.resolve()

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task, task)
  queue = result.then(
    () => undefined,
    () => undefined,
  )
  return result
}

async function readAll(): Promise<Task[]> {
  try {
    const raw = await readFile(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    // Corrupted/invalid JSON on disk - fail safe to an empty list rather
    // than crashing the server; the next write will repair the file.
    console.error('Failed to parse tasks.json, treating as empty list:', err)
    return []
  }
}

async function writeAll(tasks: Task[]): Promise<void> {
  await mkdir(path.dirname(DATA_FILE), { recursive: true })
  await writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8')
}

function sortNewestFirst(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export function listTasks(status?: TaskStatus): Promise<Task[]> {
  return enqueue(async () => {
    const tasks = await readAll()
    const filtered = status ? tasks.filter((t) => t.status === status) : tasks
    return sortNewestFirst(filtered)
  })
}

export function getTask(id: string): Promise<Task | undefined> {
  return enqueue(async () => {
    const tasks = await readAll()
    return tasks.find((t) => t.id === id)
  })
}

export function createTask(input: CreateTaskInput): Promise<Task> {
  return enqueue(async () => {
    const tasks = await readAll()
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      status: input.status,
      due_date: input.due_date ?? null,
      created_at: new Date().toISOString(),
    }
    tasks.push(task)
    await writeAll(tasks)
    return task
  })
}

export function updateTask(id: string, patch: UpdateTaskInput): Promise<Task | undefined> {
  return enqueue(async () => {
    const tasks = await readAll()
    const index = tasks.findIndex((t) => t.id === id)
    if (index === -1) return undefined

    const updated: Task = {
      ...tasks[index],
      ...patch,
    }
    tasks[index] = updated
    await writeAll(tasks)
    return updated
  })
}

export function deleteTask(id: string): Promise<boolean> {
  return enqueue(async () => {
    const tasks = await readAll()
    const next = tasks.filter((t) => t.id !== id)
    if (next.length === tasks.length) return false
    await writeAll(next)
    return true
  })
}
