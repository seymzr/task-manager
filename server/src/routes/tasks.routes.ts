import { Router, type NextFunction, type Request, type Response } from 'express'
import { z } from 'zod'
import * as repo from '../data/tasks.repository.js'
import { createTaskSchema, updateTaskSchema } from '../validation/task.schema.js'

export const tasksRouter = Router()

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

// Wraps a handler so rejected promises are forwarded to Express's error
// middleware instead of crashing the process.
function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next)
  }
}

const statusQuerySchema = z.enum(['pending', 'done']).optional()

tasksRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const parsedStatus = statusQuerySchema.safeParse(req.query.status)
    if (!parsedStatus.success) {
      res.status(400).json({ error: 'status must be "pending" or "done"' })
      return
    }
    const tasks = await repo.listTasks(parsedStatus.data)
    res.json(tasks)
  }),
)

tasksRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const task = await repo.getTask(req.params.id)
    if (!task) {
      res.status(404).json({ error: 'task not found' })
      return
    }
    res.json(task)
  }),
)

tasksRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = createTaskSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'validation failed', details: parsed.error.flatten() })
      return
    }
    const task = await repo.createTask(parsed.data)
    res.status(201).json(task)
  }),
)

tasksRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const parsed = updateTaskSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'validation failed', details: parsed.error.flatten() })
      return
    }
    const task = await repo.updateTask(req.params.id, parsed.data)
    if (!task) {
      res.status(404).json({ error: 'task not found' })
      return
    }
    res.json(task)
  }),
)

tasksRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const deleted = await repo.deleteTask(req.params.id)
    if (!deleted) {
      res.status(404).json({ error: 'task not found' })
      return
    }
    res.status(204).send()
  }),
)
