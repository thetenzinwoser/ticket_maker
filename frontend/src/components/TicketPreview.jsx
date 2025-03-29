import PropTypes from 'prop-types'
import DOMPurify from 'dompurify'

function TicketPreview({ content, isGenerating }) {
  const sanitizedContent = DOMPurify.sanitize(content)

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-gray-800 text-white p-4 shadow-md">
        <h2 className="text-xl font-semibold">Generated Ticket</h2>
        {isGenerating && (
          <span className="text-sm text-gray-300 animate-pulse">
            Generating...
          </span>
        )}
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        {content ? (
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p className="text-center">
              {isGenerating 
                ? "Generating your ticket..." 
                : "Your generated ticket will appear here"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

TicketPreview.propTypes = {
  content: PropTypes.string.isRequired,
  isGenerating: PropTypes.bool.isRequired,
}

export default TicketPreview 