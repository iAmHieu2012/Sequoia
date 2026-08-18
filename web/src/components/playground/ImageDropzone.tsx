import { useRef, useState, DragEvent } from 'react';
import { Upload } from 'lucide-react';

interface ImageDropzoneProps {
  /** Callback fired when a valid image or video file is selected or dropped */
  onUpload: (file: File) => void;
}

/**
 * A drag-and-drop zone that allows users to upload custom images and videos.
 * Handles drag events and click-to-upload via a hidden file input.
 */

export default function ImageDropzone({ onUpload }: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`w-full h-full flex flex-col items-center justify-center gap-4 text-text-dim transition-all ${
        isDragging ? 'bg-system/10 text-system border-2 border-dashed border-system' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div 
        className="w-16 h-16 border-2 border-dashed border-current flex items-center justify-center rounded-full hover:scale-110 hover:shadow-[0_0_20px_var(--color-system)] transition-all cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-6 h-6" />
      </div>
      <span className="font-mono text-[10px] tracking-widest uppercase text-center px-4">
        CLICK OR DRAG IMAGE / VIDEO HERE
      </span>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files && onUpload(e.target.files[0])} 
        accept="image/*,video/*" 
        className="hidden" 
      />
    </div>
  );
}
