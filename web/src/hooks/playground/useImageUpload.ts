import { useState, useRef } from 'react';

export function useImageUpload() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);

  const handleUpload = (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert("Chỉ hỗ trợ file ảnh hoặc video.");
      return;
    }
    
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    
    const url = URL.createObjectURL(file);
    setUploadedFile(file);
    setFileUrl(url);
    setFileType(file.type.startsWith('image/') ? 'image' : 'video');
  };

  const clearUpload = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setUploadedFile(null);
    setFileUrl(null);
    setFileType(null);
  };

  return {
    uploadedFile,
    fileUrl,
    fileType,
    handleUpload,
    clearUpload
  };
}
