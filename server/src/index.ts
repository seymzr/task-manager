import express, { type NextFunction, type Request, type Response } from 'express'
import { tasksRouter } from './routes/tasks.routes.js'

const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001

app.use(express.json())

// express.json() throws a SyntaxError for malformed JSON bodies before our
// route handlers ever run - catch it here and respond 400 instead of
// letting it crash the process.
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'malformed JSON in request body' })
    return
  }
  next(err)
})

app.use('/tasks', tasksRouter)

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'not found' })
})

// Final safety net: any error a route handler didn't handle itself still
// gets a JSON 500 response instead of crashing the server.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'internal server error' })
})

app.listen(PORT, () => {
  console.log(`Task Tracker API listening on http://localhost:${PORT}`)
})
