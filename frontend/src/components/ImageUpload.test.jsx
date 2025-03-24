import { render, screen, fireEvent } from '@testing-library/react';
import { ImageUpload } from './ImageUpload';
import { toast } from 'react-hot-toast';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');

describe('ImageUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload area', () => {
    render(<ImageUpload />);
    expect(screen.getByText(/Drag and drop images here/i)).toBeInTheDocument();
  });

  it('handles valid file upload', () => {
    const onImagesChange = jest.fn();
    render(<ImageUpload onImagesChange={onImagesChange} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByTestId('image-preview-0')).toBeInTheDocument();
    expect(onImagesChange).toHaveBeenCalledWith([file]);
  });

  it('validates file type', () => {
    render(<ImageUpload />);

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('valid image type'));
  });

  it('validates file size', () => {
    render(<ImageUpload />);

    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('too large'));
  });

  it('removes image when clicking remove button', () => {
    const onImagesChange = jest.fn();
    render(<ImageUpload onImagesChange={onImagesChange} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByTestId('remove-button-0'));

    expect(screen.queryByTestId('image-preview-0')).not.toBeInTheDocument();
    expect(onImagesChange).toHaveBeenCalledWith([]);
  });
}); 