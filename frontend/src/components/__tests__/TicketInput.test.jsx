import { render, screen, fireEvent } from '@testing-library/react'
import TicketInput from '../TicketInput'

describe('TicketInput Component', () => {
  const mockOnGenerate = jest.fn()

  beforeEach(() => {
    render(<TicketInput onGenerate={mockOnGenerate} />)
  })

  test('renders textarea with correct placeholder', () => {
    expect(
      screen.getByPlaceholderText('Add in your Jira ticket description...')
    ).toBeInTheDocument()
  })

  test('renders file input', () => {
    expect(screen.getByText('Attachments')).toBeInTheDocument()
  })

  test('calls onGenerate when form is submitted', () => {
    const textarea = screen.getByPlaceholderText('Add in your Jira ticket description...')
    fireEvent.change(textarea, { target: { value: 'Test description' } })
    
    const submitButton = screen.getByText('Generate Ticket')
    fireEvent.click(submitButton)

    expect(mockOnGenerate).toHaveBeenCalledWith('Test description')
  })
}) 