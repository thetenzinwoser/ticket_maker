import { render, screen } from '@testing-library/react'
import TicketPreview from '../TicketPreview'

describe('TicketPreview Component', () => {
  test('renders default message when no content provided', () => {
    render(<TicketPreview />)
    expect(
      screen.getByText('Generated ticket content will appear here...')
    ).toBeInTheDocument()
  })

  test('renders provided content', () => {
    const testContent = 'Test ticket content'
    render(<TicketPreview content={testContent} />)
    expect(screen.getByText(testContent)).toBeInTheDocument()
  })
}) 