import { useState, useCallback } from 'react'
import PropTypes from 'prop-types'

function TicketInput({ onGenerate, onStop, isGenerating, onImagesChange }) {
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState([])

  const handleSubmit = (e) => {
    e.preventDefault()
    onGenerate(description)
  }

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files)
    setFiles(newFiles)
    onImagesChange(newFiles)
  }

  const handlePaste = useCallback((e) => {
    const clipboardItems = e.clipboardData.items
    const imageFiles = []

    for (const item of clipboardItems) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        // Create a new filename with timestamp to ensure uniqueness
        const newFile = new File([file], `pasted-image-${Date.now()}.${file.type.split('/')[1]}`, {
          type: file.type
        })
        imageFiles.push(newFile)
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault() // Prevent pasting image into textarea
      const updatedFiles = [...files, ...imageFiles]
      setFiles(updatedFiles)
      onImagesChange(updatedFiles)
    }
  }, [files, onImagesChange])

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Input</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            className="w-full h-48 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            placeholder="Add in your Jira ticket description... (You can paste images directly here)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onPaste={handlePaste}
            disabled={isGenerating}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {files.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {files.length} file(s) selected
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400"
            disabled={isGenerating || !description.trim()}
          >
            {isGenerating ? 'Generating...' : 'Generate Ticket'}
          </button>
          {isGenerating && (
            <button
              type="button"
              onClick={onStop}
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
            >
              Stop
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

TicketInput.propTypes = {
  onGenerate: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  onImagesChange: PropTypes.func.isRequired,
  isGenerating: PropTypes.bool,
}

export default TicketInput 