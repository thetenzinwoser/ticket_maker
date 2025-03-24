import PropTypes from 'prop-types'
import { useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'

function TicketPreview({ content, isGenerating }) {
  const previewRef = useRef(null)

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.scrollTop = previewRef.current.scrollHeight
    }
  }, [content])

  // Function to convert Jira markdown to HTML
  const renderJiraMarkdown = (text) => {
    if (!text) return ''
    
    let html = text
      // Convert Jira headings
      .replace(/h1\.\s+(.*?)(?:\n|$)/g, '<h1>$1</h1>')
      .replace(/h2\.\s+(.*?)(?:\n|$)/g, '<h2>$1</h2>')
      .replace(/h3\.\s+(.*?)(?:\n|$)/g, '<h3>$1</h3>')
      
      // Convert Jira bullet points
      .replace(/^\s*\*\s+(.*?)(?:\n|$)/gm, '<li class="bullet-item">$1</li>')
      .replace(/(<li class="bullet-item">.*?<\/li>\n?)+/gs, '<ul class="jira-list">$&</ul>')
      
      // Convert Jira numbered lists
      .replace(/^\s*#\s+(.*?)(?:\n|$)/gm, '<li class="number-item">$1</li>')
      .replace(/(<li class="number-item">.*?<\/li>\n?)+/gs, '<ol class="jira-list">$&</ol>')
      
      // Convert color formatting
      .replace(/\{color:#([0-9a-fA-F]{3,6})\}(.*?)\{color\}/g, '<span style="color:#$1">$2</span>')
      
      // Convert bold
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
      
      // Convert italics
      .replace(/_(.*?)_/g, '<em>$1</em>')
      
      // Convert new lines to breaks
      .replace(/\n/g, '<br />')

    // Sanitize HTML to prevent XSS
    return DOMPurify.sanitize(html)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Preview</h2>
      <div 
        ref={previewRef}
        className="min-h-[300px] max-h-[500px] overflow-y-auto p-4 bg-gray-50 rounded-md jira-preview"
      >
        {isGenerating && !content && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
            <span className="text-gray-600">Generating...</span>
          </div>
        )}
        {content ? (
          <div 
            className="jira-content" 
            dangerouslySetInnerHTML={{ __html: renderJiraMarkdown(content) }}
          />
        ) : !isGenerating && (
          'Generated ticket content will appear here...'
        )}
      </div>
      {content && (
        <div className="mt-4 text-right">
          <button
            onClick={() => {navigator.clipboard.writeText(content)}}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded-md text-sm"
          >
            Copy Raw Text
          </button>
        </div>
      )}
    </div>
  )
}

TicketPreview.propTypes = {
  content: PropTypes.string,
  isGenerating: PropTypes.bool,
}

export default TicketPreview 