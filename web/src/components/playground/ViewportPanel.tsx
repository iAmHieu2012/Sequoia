import { RefObject } from 'react';
import { Zap, X, Download } from 'lucide-react';
import Image from 'next/image';
import CyberBrackets from '@/components/ui/CyberBrackets';
import ImageDropzone from './ImageDropzone';

interface ViewportPanelProps {
  videoRef: RefObject<HTMLVideoElement | HTMLImageElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  cameraActive: boolean;
  booting: boolean;
  setCameraActive: (active: boolean) => void;
  fileUrl?: string | null;
  fileType?: 'image' | 'video' | null;
  handleUpload?: (file: File) => void;
  clearUpload?: () => void;
}

export default function ViewportPanel({ 
  videoRef, canvasRef, cameraActive, booting, setCameraActive,
  fileUrl, fileType, handleUpload, clearUpload
}: ViewportPanelProps) {

  const handleScreenshot = () => {
    const media = videoRef.current;
    const overlay = canvasRef.current;
    if (!media || !overlay) return;

    const canvas = document.createElement('canvas');
    let width = 0, height = 0;
    if (media instanceof HTMLVideoElement) {
      width = media.videoWidth;
      height = media.videoHeight;
    } else if (media instanceof HTMLImageElement) {
      width = media.naturalWidth;
      height = media.naturalHeight;
    }

    if (!width || !height) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(media, 0, 0, width, height);
    ctx.drawImage(overlay, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `sequoia_inference_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex-1 bg-black/80 border border-panel-border relative flex flex-col overflow-hidden group">
      <CyberBrackets color="border-system/30 group-hover:border-system transition-colors" />
      
      <div className="absolute top-3 left-3 z-20 pointer-events-none flex items-center justify-between w-full pr-6">
        <span className="bg-black/90 text-system border border-system/30 px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase flex items-center gap-2">
          <Zap className="w-3 h-3" />
          VISION_VIEWPORT
        </span>
      </div>

      <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
        {(cameraActive || fileUrl) && (
          <button 
            onClick={handleScreenshot}
            className="bg-black/60 hover:bg-system/20 text-text-dim hover:text-system border border-panel-border hover:border-system transition-colors p-2 rounded-full backdrop-blur flex items-center justify-center"
            title="Export Screenshot"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
        {fileUrl && (
          <button 
            onClick={clearUpload}
            className="bg-black/60 hover:bg-coral/20 text-text-dim hover:text-coral border border-panel-border hover:border-coral transition-colors p-2 rounded-full backdrop-blur"
            title="Clear Upload"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        {booting ? (
          <div className="text-system font-mono text-sm tracking-widest animate-pulse">
            &gt; STANDBY...
          </div>
        ) : cameraActive ? (
          <div className="absolute inset-0 bg-space-bg flex items-center justify-center overflow-hidden">
            <video 
              ref={videoRef as React.RefObject<HTMLVideoElement>}
              className="absolute w-full h-full object-contain"
              playsInline
              muted
            />
            <canvas 
              ref={canvasRef}
              className="absolute w-full h-full object-contain z-40 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-system/5 to-transparent animate-[scanline_4s_linear_infinite] z-20 pointer-events-none" />
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] z-30 pointer-events-none" />
          </div>
        ) : fileUrl ? (
          <div className="absolute inset-0 bg-space-bg flex items-center justify-center overflow-hidden">
            {fileType === 'video' ? (
              <video 
                ref={videoRef as React.RefObject<HTMLVideoElement>}
                src={fileUrl}
                className="absolute w-full h-full object-contain"
                playsInline
                muted
                autoPlay
                loop
              />
            ) : (
              <Image 
                ref={videoRef as React.RefObject<HTMLImageElement>}
                id="uploaded-image"
                src={fileUrl}
                width={0} height={0} sizes="100vw" unoptimized
                className="absolute w-full h-full object-contain"
                alt="Uploaded"
                crossOrigin="anonymous"
              />
            )}
            <canvas 
              ref={canvasRef}
              className="absolute w-full h-full object-contain z-40 pointer-events-none"
            />
          </div>
        ) : (
          <div className="absolute inset-0 p-8 flex items-center justify-center">
             {handleUpload && <ImageDropzone onUpload={handleUpload} />}
          </div>
        )}
      </div>
    </div>
  );
}
