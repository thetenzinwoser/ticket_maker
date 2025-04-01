import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

function ImageUpload({ onChange, disabled }) {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(`${file.name} is not a valid image type. Please use JPEG or PNG.`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} is too large. Maximum size is 5MB.`);
      return false;
    }
    return true;
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    
    if (images.length + fileArray.length > MAX_FILES) {
      toast.error(`You can only upload up to ${MAX_FILES} images.`);
      return;
    }

    const validFiles = fileArray.filter(validateFile);
    const newImagePreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => {
      const updated = [...prev, ...newImagePreviews];
      onChange?.(updated.map(img => img.file));
      return updated;
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveImage = (index) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onChange?.(updated.map(img => img.file));
      return updated;
    });
  };

  return (
    <div className="w-full">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          data-testid="file-input"
        />
        <p className="text-gray-600">
          Drag and drop images here or click to select files
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Maximum 10 images, JPEG/PNG only, 5MB max per file
        </p>
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
                data-testid={`image-preview-${index}`}
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                data-testid={`remove-button-${index}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

ImageUpload.propTypes = {
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default ImageUpload; 