import PropTypes from 'prop-types'
import DOMPurify from 'dompurify'
import Markdown from 'markdown-to-jsx'

function TicketPreview({ content, isGenerating }) {
  const sanitizedContent = DOMPurify.sanitize(content)

  return (
    <>
      {content ? (
        <div className="prose prose-lg max-w-none jira-content">
          <Markdown
            options={{
              overrides: {
                h1: {
                  component: 'h1',
                  props: {
                    className: 'text-2xl font-bold mb-4 pb-2 border-b border-gray-200',
                  },
                },
                h2: {
                  component: 'h2',
                  props: {
                    className: 'text-xl font-semibold mt-6 mb-3 text-[#172B4D]',
                  },
                },
                ul: {
                  component: 'ul',
                  props: {
                    className: 'list-disc pl-6 mb-4 space-y-2',
                  },
                },
                ol: {
                  component: 'ol',
                  props: {
                    className: 'list-decimal pl-6 mb-4 space-y-2',
                  },
                },
                li: {
                  component: 'li',
                  props: {
                    className: 'text-[#172B4D]',
                  },
                },
                p: {
                  component: 'p',
                  props: {
                    className: 'mb-4 text-[#172B4D]',
                  },
                },
              },
            }}
          >
            {sanitizedContent}
          </Markdown>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          <p className="text-center">
            {isGenerating 
              ? "Generating your ticket..." 
              : "Your generated ticket will appear here"}
          </p>
        </div>
      )}
    </>
  )
}

TicketPreview.propTypes = {
  content: PropTypes.string.isRequired,
  isGenerating: PropTypes.bool.isRequired,
}

export default TicketPreview 