import { Camera, Upload } from 'lucide-react';

interface InputSourceSelectorProps {
  /** True if the camera feed is currently selected */
  cameraActive: boolean;
  /** True if the AI model is currently booting */
  booting: boolean;
  /** Callback to switch between camera and file upload modes */
  setCameraActive: (active: boolean) => void;
  /** Array of supported input modes dictated by the AI model metadata */
  supportedModes?: ('camera' | 'image')[];
}

/**
 * A toggle switch to select the input source for the AI Inference engine.
 * Allows users to choose between live webcam feed or static file uploads.
 */

export default function InputSourceSelector({ cameraActive, booting, setCameraActive, supportedModes = ['camera', 'image'] }: InputSourceSelectorProps) {
  const supportsCamera = supportedModes.includes('camera');
  
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">INPUT_SOURCE</span>
      <div className="flex gap-2">
        {supportsCamera && (
          <button 
            className={`flex-1 py-2 border font-mono text-[9px] tracking-widest flex items-center justify-center gap-2 transition-colors ${cameraActive ? 'border-system bg-system/10 text-system shadow-[0_0_10px_var(--color-system)]' : 'border-panel-border text-text-dim hover:border-system/50 hover:text-white'}`}
            onClick={() => setCameraActive(true)}
            disabled={booting}
          >
            <Camera className="w-3 h-3" /> CAM
          </button>
        )}
        <button 
          className={`flex-1 py-2 border font-mono text-[9px] tracking-widest flex items-center justify-center gap-2 transition-colors ${!cameraActive && !booting ? 'border-system bg-system/10 text-system shadow-[0_0_10px_var(--color-system)]' : 'border-panel-border text-text-dim hover:border-system/50 hover:text-white'}`}
          onClick={() => setCameraActive(false)}
          disabled={booting}
        >
          <Upload className="w-3 h-3" /> DATA
        </button>
      </div>
    </div>
  );
}
