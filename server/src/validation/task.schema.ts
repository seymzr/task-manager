import { z } from 'zod'

const title = z
  .string({ required_error: 'title is required' })
  .trim()
  .min(1, 'title cannot be empty or whitespace-only')
  .max(200, 'title cannot exceed 200 characters')

const status = z.enum(['pending', 'done'], {
  errorMap: () => ({ message: 'status must be "pending" or "done"' }),
})

// Plain YYYY-MM-DD date string, matching the spec's sample response format.
const dueDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'due_date must be in YYYY-MM-DD format')
  .nullable()

export const createTaskSchema = z.object({
  title,
  status: status.optional().default('pending'),
  due_date: dueDate.optional(),
})

export const updateTaskSchema = z
  .object({
    title: title.optional(),
    status: status.optional(),
    due_date: dueDate.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'at least one field (title, status, due_date) must be provided',
  })

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
