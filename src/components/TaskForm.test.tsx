import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaskForm } from './TaskForm'

function renderForm() {
  const onCreate = vi.fn().mockResolvedValue(true)
  render(<TaskForm onCreate={onCreate} busy={false} />)
  const titleInput = screen.getByLabelText(/task title/i)
  const submit = screen.getByRole('button', { name: /add task/i })
  return { onCreate, titleInput, submit }
}

describe('TaskForm validation', () => {
  it('blocks an empty title', async () => {
    const { onCreate, submit } = renderForm()

    await userEvent.click(submit)

    expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    expect(onCreate).not.toHaveBeenCalled()
  })

  it('blocks a whitespace-only title', async () => {
    const { onCreate, titleInput, submit } = renderForm()

    await userEvent.type(titleInput, '    ')
    await userEvent.click(submit)

    expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    expect(onCreate).not.toHaveBeenCalled()
  })

  it('blocks a title longer than 200 characters', async () => {
    const { onCreate, titleInput, submit } = renderForm()

    await userEvent.type(titleInput, 'a'.repeat(201))
    await userEvent.click(submit)

    expect(screen.getByText(/cannot exceed 200 characters/i)).toBeInTheDocument()
    expect(onCreate).not.toHaveBeenCalled()
  })

  it('submits a valid, trimmed title', async () => {
    const { onCreate, titleInput, submit } = renderForm()

    await userEvent.type(titleInput, '  Buy milk  ')
    await userEvent.click(submit)

    expect(onCreate).toHaveBeenCalledWith({ title: 'Buy milk', due_date: null })
  })
})
