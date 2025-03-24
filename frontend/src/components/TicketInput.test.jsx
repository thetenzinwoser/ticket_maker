import { render, fireEvent, screen } from '@testing-library/react'
import TicketInput from './TicketInput'

describe('TicketInput', () => {
  const mockOnGenerate = jest.fn()
  const mockOnStop = jest.fn()
  const mockOnImagesChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('handles image paste', () => {
    render(
      <TicketInput
        onGenerate={mockOnGenerate}
        onStop={mockOnStop}
        onImagesChange={mockOnImagesChange}
        isGenerating={false}
      />
    )

    const textarea = screen.getByPlaceholderText(/Add in your Jira ticket description/i)

    // Create a mock clipboard event with an image
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' })
    const clipboardData = {
      items: [
        {
          type: 'image/png',
          getAsFile: () => file
        }
      ]
    }

    fireEvent.paste(textarea, {
      clipboardData
    })

    expect(mockOnImagesChange).toHaveBeenCalled()
    const calledFiles = mockOnImagesChange.mock.calls[0][0]
    expect(calledFiles).toHaveLength(1)
    expect(calledFiles[0].type).toBe('image/png')
  })
}) 