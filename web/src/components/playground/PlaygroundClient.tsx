"use client";

import CyberGrid from "@/components/ui/CyberGrid";
import { usePlayground } from "@/hooks/playground";
import ModelInfoBar from "@/components/playground/ModelInfoBar";
import LogsPanel from "@/components/playground/LogsPanel";
import TelemetryPanel from "@/components/playground/TelemetryPanel";
import ViewportPanel from "@/components/playground/ViewportPanel";
import ParameterPanel from "@/components/playground/ParameterPanel";

interface PlaygroundClientProps {
  modelId: string;
}

/**
 * Client component for the Playground. Handles all WebRTC, Canvas, and interaction state.
 */
export default function PlaygroundClient({ modelId }: PlaygroundClientProps) {
  const {
    model,
    metadata,
    loading,
    booting,
    logs,
    cameraActive,
    setCameraActive,
    params: playgroundParams,
    updateParam,
    resetParams,
    telemetry,
    videoRef,
    canvasRef,
    handleEscape,
    fileUrl,
    fileType,
    handleUpload,
    clearUpload
  } = usePlayground(modelId);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-space-bg flex items-center justify-center text-system font-mono text-xl animate-pulse tracking-widest">
        ESTABLISHING UPLINK...
      </div>
    );
  }

  if (!model) {
    return (
      <div className="h-screen w-screen bg-space-bg flex items-center justify-center flex-col gap-4 text-coral font-mono tracking-widest">
        <div>MODEL NOT FOUND</div>
        <button onClick={handleEscape} className="text-white hover:text-system text-sm border-b border-panel-border pb-1">
          [ ESC ] RETURN
        </button>
      </div>
    );
  }

  const paramDefs = metadata?.parameters || [];

  return (
    <div className="h-screen w-screen bg-space-bg text-text-main font-sans overflow-hidden flex flex-col relative select-none scanline-effect">
      <CyberGrid />

      <ModelInfoBar 
        model={model} 
        booting={booting} 
        handleEscape={handleEscape} 
      />

      <div className="flex-1 flex p-4 lg:p-6 gap-6 relative z-10 min-h-0">
        
        <div className="w-64 flex flex-col gap-4 shrink-0 hidden md:flex">
          <LogsPanel logs={logs} booting={booting} />
          
          <TelemetryPanel 
            telemetry={telemetry} 
            cameraActive={cameraActive} 
            metadata={metadata} 
            model={model} 
          />
        </div>

        <ViewportPanel 
          videoRef={videoRef} 
          canvasRef={canvasRef} 
          cameraActive={cameraActive} 
          booting={booting} 
          setCameraActive={setCameraActive} 
          fileUrl={fileUrl}
          fileType={fileType}
          handleUpload={handleUpload}
          clearUpload={clearUpload}
        />

        <ParameterPanel 
          paramDefs={paramDefs} 
          playgroundParams={playgroundParams} 
          updateParam={updateParam} 
          resetParams={resetParams} 
          cameraActive={cameraActive} 
          booting={booting} 
          setCameraActive={setCameraActive} 
          supportedModes={metadata?.supported_modes}
        />
      </div>
    </div>
  );
}
