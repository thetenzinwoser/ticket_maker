import { render, screen, fireEvent, act } from '@testing-library/react'
import App from './App'

// Mock fetch
global.fetch = jest.fn()
global.TextDecoder = jest.fn(() => ({
  decode: jest.fn(text => text)
}))

describe('App Component', () => {
  test('renders main layout', () => {
    render(<App />)
    expect(screen.getByText('Ticket Generator')).toBeInTheDocument()
    expect(screen.getByText('Input')).toBeInTheDocument()
    expect(screen.getByText('Preview')).toBeInTheDocument()
  })
})

describe('App Component with Streaming', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  test('handles streaming response', async () => {
    const mockStream = {
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ value: new TextEncoder().encode('Processing'), done: false })
          .mockResolvedValueOnce({ value: new TextEncoder().encode(' ticket...'), done: false })
          .mockResolvedValueOnce({ done: true })
      })
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      body: mockStream
    })

    render(<App />)

    const textarea = screen.getByPlaceholderText(/Add in your Jira ticket/i)
    const submitButton = screen.getByText('Generate Ticket')

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Test description' } })
      fireEvent.click(submitButton)
    })

    expect(await screen.findByText(/Processing ticket.../i)).toBeInTheDocument()
  })

  test('handles error response', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Test error' })
    })

    render(<App />)

    const textarea = screen.getByPlaceholderText(/Add in your Jira ticket/i)
    const submitButton = screen.getByText('Generate Ticket')

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Test description' } })
      fireEvent.click(submitButton)
    })

    expect(await screen.findByText(/Test error/i)).toBeInTheDocument()
  })
})

describe('Stop Generation', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  test('stops generation when stop button is clicked', async () => {
    const mockAbort = jest.fn()
    const mockStream = {
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ value: new TextEncoder().encode('Processing'), done: false })
          .mockImplementationOnce(() => new Promise(() => {})) // Hanging promise
      })
    }

    global.AbortController = jest.fn(() => ({
      signal: {},
      abort: mockAbort
    }))

    fetch.mockResolvedValueOnce({
      ok: true,
      body: mockStream
    })

    render(<App />)

    const textarea = screen.getByPlaceholderText(/Add in your Jira ticket/i)
    const generateButton = screen.getByText('Generate Ticket')

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Test description' } })
      fireEvent.click(generateButton)
    })

    const stopButton = await screen.findByText('Stop')
    fireEvent.click(stopButton)

    expect(mockAbort).toHaveBeenCalled()
    expect(screen.queryByText('Generating...')).not.toBeInTheDocument()
  })
})

test('displays toast notification on error', async () => {
  fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')))
  
  render(<App />)
  
  const textarea = screen.getByPlaceholderText(/Add in your Jira ticket/i)
  const submitButton = screen.getByText('Generate Ticket')
  
  await act(async () => {
    fireEvent.change(textarea, { target: { value: 'Test description' } })
    fireEvent.click(submitButton)
  })
  
  // Check that the toast appears with the error message
  expect(await screen.findByText(/Error: Network error/i)).toBeInTheDocument()
})

test('validates file types', async () => {
  render(<App />)
  
  // Create a mock file input event with an invalid file type
  const invalidFile = new File(['dummy content'], 'test.txt', { type: 'text/plain' })
  const mockFileEvent = { target: { files: [invalidFile] } }
  
  const fileInput = screen.getByLabelText(/Attachments/i)
  fireEvent.change(fileInput, mockFileEvent)
  
  // Check that the toast appears with the error message
  expect(await screen.findByText(/Invalid file type/i)).toBeInTheDocument()
})
