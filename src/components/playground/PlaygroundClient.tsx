"use client";

import { useState } from "react";
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

  const [mobilePanel, setMobilePanel] = useState<'params' | 'logs'>('params');

  if (loading) {
    return (
      <div className="h-screen w-screen bg-space-bg flex items-center justify-center text-white/40 font-mono text-xl animate-pulse tracking-widest">
        ESTABLISHING UPLINK...
      </div>
    );
  }

  if (!model) {
    return (
      <div className="h-screen w-screen bg-space-bg flex items-center justify-center flex-col gap-4 text-coral font-mono tracking-widest">
        <div>MODEL NOT FOUND</div>
        <button onClick={handleEscape} className="text-white/40 hover:text-white transition-colors text-sm border-b border-white/10 pb-1">
          [ ESC ] RETURN
        </button>
      </div>
    );
  }

  const paramDefs = metadata?.parameters || [];

  return (
    <div className="h-screen w-screen bg-space-bg text-text-main font-sans overflow-hidden flex flex-col relative select-none">
      <CyberGrid />

      <ModelInfoBar 
        model={model} 
        booting={booting} 
        handleEscape={handleEscape} 
      />

      <div className="flex-1 flex flex-col lg:flex-row p-3 lg:p-6 gap-4 lg:gap-6 relative z-10 min-h-0">
        
        {/* DESKTOP Left Column */}
        <div className="w-80 flex-col gap-4 shrink-0 hidden lg:flex">
          <LogsPanel logs={logs} booting={booting} />
          <TelemetryPanel telemetry={telemetry} cameraActive={cameraActive} metadata={metadata} model={model} />
        </div>

        {/* VIEWPORT (Top on mobile, Middle on desktop) */}
        <div className="flex-1 lg:flex-1 relative flex flex-col min-h-0">
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
        </div>

        {/* DESKTOP Right Column */}
        <ParameterPanel 
          className="hidden lg:flex"
          paramDefs={paramDefs} 
          playgroundParams={playgroundParams} 
          updateParam={updateParam} 
          resetParams={resetParams} 
          cameraActive={cameraActive} 
          booting={booting} 
          setCameraActive={setCameraActive} 
          supportedModes={metadata?.supported_modes}
        />

        {/* MOBILE / TABLET Bottom Area (Split-screen Tabs) */}
        <div className="flex-1 flex flex-col lg:hidden min-h-0 bg-space-bg/50 rounded-lg border border-white/10">
          {/* Tabs Header */}
          <div className="flex flex-shrink-0 border-b border-white/10 bg-space-bg">
            {[
              { id: 'params', label: 'PARAMETERS' },
              { id: 'logs', label: 'SYSTEM LOGS' },
            ].map(tab => {
              const isActive = mobilePanel === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setMobilePanel(tab.id as 'params' | 'logs')}
                  className={`group relative z-10 flex-1 h-14 md:h-16 flex flex-col justify-center px-4 md:px-6 transition-colors duration-200 cursor-pointer border-r border-white/10 last:border-r-0 bg-transparent overflow-hidden ${
                    isActive ? "text-space-bg" : "text-white/40 hover:text-white"
                  }`}
                >
                  {/* Individual Slide Fill */}
                  <div 
                    className={`absolute top-0 left-0 h-full w-full bg-white clip-mod-1 transition-transform duration-300 ease-out z-0 ${
                      isActive ? "translate-x-0" : "-translate-x-full group-hover:-translate-x-[95%]"
                    }`}
                  />
                  <div className="relative z-10 flex items-center justify-center w-full">
                    <span className="text-sm font-mono font-bold tracking-[0.12em] uppercase">
                      {tab.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tabs Content */}
          <div key={mobilePanel} className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 animate-snap-in min-h-0">
            {mobilePanel === 'params' ? (
              <ParameterPanel 
                className="w-full flex-none"
                paramDefs={paramDefs} 
                playgroundParams={playgroundParams} 
                updateParam={updateParam} 
                resetParams={resetParams} 
                cameraActive={cameraActive} 
                booting={booting} 
                setCameraActive={setCameraActive} 
                supportedModes={metadata?.supported_modes}
              />
            ) : (
              <>
                <TelemetryPanel 
                  className="w-full shrink-0"
                  telemetry={telemetry} 
                  cameraActive={cameraActive} 
                  metadata={metadata} 
                  model={model} 
                />
                <LogsPanel 
                  className="w-full min-h-[250px] shrink-0"
                  logs={logs} 
                  booting={booting} 
                />
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
