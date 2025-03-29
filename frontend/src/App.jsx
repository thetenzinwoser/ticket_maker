import { useState, useRef, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import TicketInput from './components/TicketInput'
import TicketPreview from './components/TicketPreview'
import { ImageUpload } from './components/ImageUpload'
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from './api/config';

function App() {
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState([])
  const abortControllerRef = useRef(null)
  
  // Clean up any pending requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleGenerate = async (description) => {
    if (!description.trim()) {
      toast.error('Please enter a description')
      return
    }

    setIsGenerating(true)
    setGeneratedContent('')
    
    // Create a new AbortController
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current

    try {
      // Convert images to base64
      const imagePromises = attachedFiles.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target.result)
          reader.onerror = (e) => {
            reject(new Error(`Failed to read file: ${file.name}`))
          }
          reader.readAsDataURL(file)
        })
      })
      
      const base64Images = await Promise.all(imagePromises).catch(error => {
        toast.error(error.message)
        throw error
      })
      
      console.log("Making request to:", `${API_BASE_URL}/generate-ticket`);
      
      // Make request to backend with signal
      const response = await fetch(`${API_BASE_URL}/generate-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          images: base64Images
        }),
        signal
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      // Process the streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        
        const text = decoder.decode(value)
        if (text.includes("Error generating ticket:")) {
          toast.error(text.replace("Error generating ticket:", "").trim())
          break
        }
        setGeneratedContent(prev => prev + text)
      }

    } catch (error) {
      console.error("Generation error:", error);
      
      if (error.name === 'AbortError') {
        toast.info('Generation stopped', {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      } else {
        toast.error(`Error: ${error.message}`, {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
    } finally {
      if (abortControllerRef.current) {
        abortControllerRef.current = null;
      }
      setIsGenerating(false);
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }

  const handleImagesChange = (files) => {
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png'].includes(file.type)
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
      
      if (!isValidType) {
        toast.error(`Invalid file type: ${file.name}. Only JPEG and PNG images are allowed.`)
      }
      
      if (!isValidSize) {
        toast.error(`File too large: ${file.name}. Maximum size is 5MB.`)
      }
      
      return isValidType && isValidSize
    })
    
    if (validFiles.length > 10) {
      toast.error('Maximum 10 images allowed')
      setAttachedFiles(validFiles.slice(0, 10))
    } else {
      setAttachedFiles(validFiles)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Panel - Input Section */}
      <div className="w-1/2 p-6 bg-white shadow-lg">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Ticket Generator</h1>
          <TicketInput
            onGenerate={handleGenerate}
            onStop={handleStop}
            isGenerating={isGenerating}
            onImagesChange={handleImagesChange}
          />
        </div>
      </div>

      {/* Right Panel - Preview Section */}
      <div className="w-1/2 h-screen sticky top-0">
        <TicketPreview
          content={generatedContent}
          isGenerating={isGenerating}
        />
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  )
}

export default App
