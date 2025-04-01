import { useState } from 'react'
import PropTypes from 'prop-types'
import ImageUpload from './ImageUpload'

function TicketInput({ onGenerate, onStop, isGenerating, onImagesChange }) {
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onGenerate(description)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="description" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Ticket Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Describe what you need..."
            disabled={isGenerating}
          />
        </div>

        <ImageUpload onChange={onImagesChange} disabled={isGenerating} />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isGenerating || !description.trim()}
            className={`flex-1 py-2.5 px-4 rounded-lg text-white font-medium transition-colors ${
              isGenerating || !description.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isGenerating ? 'Generating...' : 'Generate Ticket'}
          </button>

          {isGenerating && (
            <button
              type="button"
              onClick={onStop}
              className="py-2.5 px-4 rounded-lg text-red-600 font-medium border border-red-600 hover:bg-red-50 transition-colors"
            >
              Stop
            </button>
          )}
        </div>
      </form>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Tips:</h3>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>Be specific about the feature or bug you're describing</li>
          <li>Include any relevant context or requirements</li>
          <li>Attach screenshots or mockups if available</li>
        </ul>
      </div>
    </div>
  )
}

TicketInput.propTypes = {
  onGenerate: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  isGenerating: PropTypes.bool.isRequired,
  onImagesChange: PropTypes.func.isRequired,
}

export default TicketInput 