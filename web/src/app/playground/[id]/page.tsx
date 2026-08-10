"use client";

import { useParams } from "next/navigation";
import { ChevronLeft, Camera, Upload, Cpu, Activity, Zap } from "lucide-react";
import CyberGrid from "@/components/ui/CyberGrid";
import CyberBrackets from "@/components/ui/CyberBrackets";
import { usePlayground } from "@/hooks/playground";

export default function Playground() {
  const params = useParams();
  const modelId = params.id as string;
  const {
    model,
    loading,
    booting,
    logs,
    cameraActive,
    setCameraActive,
    threshold,
    setThreshold,
    iouThreshold,
    setIouThreshold,
    fps,
    inferenceTime,
    videoRef,
    canvasRef,
    handleEscape
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

  return (
    <div className="h-screen w-screen bg-space-bg text-text-main font-sans overflow-hidden flex flex-col relative select-none scanline-effect">
      <CyberGrid />

      {/* Header */}
      <header className="flex-shrink-0 relative z-10 flex items-center justify-between px-6 py-4 border-b border-panel-border bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleEscape}
            className="inline-flex items-center text-[10px] font-mono tracking-widest uppercase bg-system/5 text-system px-4 py-2 hover:bg-system/20 hover:text-white transition-all duration-300 relative group overflow-hidden"
          >
            <CyberBrackets color="border-system/30 group-hover:border-system transition-colors duration-300" />
            <div className="absolute left-0 top-0 w-1 h-full bg-system scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-system)]" />
            <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-system/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
            <span className="relative z-10 flex items-center gap-1 group-hover:drop-shadow-[0_0_8px_var(--color-system)]">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              [ ESC ] ABORT_RUNTIME
            </span>
          </button>
          
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">ACTIVE_MODEL</span>
            <span className="text-sm font-heading font-bold text-white tracking-widest uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4 text-system" />
              {model.name}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">TASK_TYPE</span>
            <span className="text-xs font-mono text-system tracking-widest uppercase bg-system/10 px-2 py-0.5 border border-system/20">
              {model.task_type.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="w-[1px] h-8 bg-panel-border" />
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">SYS_STATUS</span>
            <span className="text-xs font-mono text-system tracking-widest uppercase flex items-center gap-2">
              {booting ? 'INITIALIZING' : 'ONLINE'}
              <span className={`w-2 h-2 ${booting ? 'bg-coral animate-pulse' : 'bg-system shadow-[0_0_8px_var(--color-system)]'}`} />
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex p-4 lg:p-6 gap-6 relative z-10 min-h-0">
        
        {/* Left Telemetry Panel */}
        <div className="w-64 flex flex-col gap-4 shrink-0 hidden md:flex">
          <div className="flex-1 bg-black/60 border border-panel-border relative flex flex-col min-h-0 p-4">
            <CyberBrackets color="border-system/30" />
            <div className="text-[10px] font-mono text-text-dim tracking-widest uppercase border-b border-panel-border pb-2 mb-3">
              RUNTIME_LOGS
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-[10px] text-system/80 flex flex-col gap-2 leading-relaxed">
              {logs.map((log, i) => (
                <div key={i} className="animate-[fadeIn_0.3s_ease-out]">{log}</div>
              ))}
              {booting && <div className="animate-pulse">_</div>}
            </div>
          </div>

          <div className="bg-black/60 border border-panel-border relative p-4 flex flex-col gap-4 shrink-0">
            <CyberBrackets color="border-system/30" />
            <div className="text-[10px] font-mono text-text-dim tracking-widest uppercase border-b border-panel-border pb-2">
              TELEMETRY
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-text-dim tracking-widest">FPS</span>
              <span className="text-sm font-mono text-white tracking-widest flex items-center gap-1">
                {cameraActive ? fps : '--'} <Activity className="w-3 h-3 text-system" />
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-text-dim tracking-widest">INFERENCE</span>
              <span className="text-sm font-mono text-white tracking-widest flex items-center gap-1">
                {cameraActive ? inferenceTime : '--'} <span className="text-[9px] text-system">ms</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-text-dim tracking-widest">MEMORY</span>
              <span className="text-sm font-mono text-white tracking-widest flex items-center gap-1">
                {cameraActive ? ((performance as any).memory ? Math.round((performance as any).memory.usedJSHeapSize / 1048576) : 'N/A') : '--'} <span className="text-[9px] text-system">MB</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center Viewport */}
        <div className="flex-1 bg-black/80 border border-panel-border relative flex flex-col overflow-hidden group">
          <CyberBrackets color="border-system/30 group-hover:border-system transition-colors" />
          
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <span className="bg-black/90 text-system border border-system/30 px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase flex items-center gap-2">
              <Zap className="w-3 h-3" />
              VISION_VIEWPORT
            </span>
          </div>

          {/* Camera Feed Placeholder */}
          <div className="flex-1 relative flex items-center justify-center">
            {booting ? (
              <div className="text-system font-mono text-sm tracking-widest animate-pulse">
                &gt; STANDBY...
              </div>
            ) : cameraActive ? (
              <>
                {/* Canvas Overlay for Detections */}
                <div className="absolute inset-0 bg-space-bg flex items-center justify-center overflow-hidden">
                  <video 
                    ref={videoRef}
                    className="absolute min-w-full min-h-full object-cover"
                    playsInline
                    muted
                  />
                  <canvas 
                    ref={canvasRef}
                    className="absolute min-w-full min-h-full object-cover z-40 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-system/5 to-transparent animate-[scanline_4s_linear_infinite] z-20 pointer-events-none" />
                  <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] z-30 pointer-events-none" />
                </div>
              </>
            ) : (
              <button 
                onClick={() => setCameraActive(true)}
                className="flex flex-col items-center gap-4 text-text-dim hover:text-system transition-colors"
              >
                <div className="w-16 h-16 border-2 border-dashed border-current flex items-center justify-center rounded-full hover:scale-110 hover:shadow-[0_0_20px_var(--color-system)] transition-all">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] tracking-widest uppercase">INIT_CAMERA_FEED</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Parameters Panel */}
        <div className="w-64 bg-black/60 border border-panel-border relative flex flex-col p-4 shrink-0 hidden lg:flex">
          <CyberBrackets color="border-system/30" />
          <div className="text-[10px] font-mono text-text-dim tracking-widest uppercase border-b border-panel-border pb-2 mb-4">
            PARAMETERS
          </div>
          
          <div className="flex flex-col gap-6">
            {/* Input Source */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">INPUT_SOURCE</span>
              <div className="flex gap-2">
                <button 
                  className={`flex-1 py-2 border font-mono text-[9px] tracking-widest flex items-center justify-center gap-2 transition-colors ${cameraActive ? 'border-system bg-system/10 text-system shadow-[0_0_10px_var(--color-system)]' : 'border-panel-border text-text-dim hover:border-system/50 hover:text-white'}`}
                  onClick={() => setCameraActive(true)}
                  disabled={booting}
                >
                  <Camera className="w-3 h-3" /> CAM
                </button>
                <button 
                  className={`flex-1 py-2 border font-mono text-[9px] tracking-widest flex items-center justify-center gap-2 transition-colors ${!cameraActive && !booting ? 'border-system bg-system/10 text-system shadow-[0_0_10px_var(--color-system)]' : 'border-panel-border text-text-dim hover:border-system/50 hover:text-white'}`}
                  onClick={() => setCameraActive(false)}
                  disabled={booting}
                >
                  <Upload className="w-3 h-3" /> DATA
                </button>
              </div>
            </div>

            {/* Threshold Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">CONFIDENCE_THRESHOLD</span>
                <span className="text-xs font-mono text-system font-bold">{threshold}%</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full h-1 bg-panel-border appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-system [&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--color-system)]"
              />
              <div className="flex justify-between w-full mt-1">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`w-[2px] h-1.5 ${i * 10 < threshold ? 'bg-system' : 'bg-panel-border'}`} />
                ))}
              </div>
            </div>

            {/* NMS IoU */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">IOU_THRESHOLD</span>
                <span className="text-xs font-mono text-white">{iouThreshold}%</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={iouThreshold} 
                onChange={(e) => setIouThreshold(Number(e.target.value))}
                className="w-full h-1 bg-panel-border appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
              />
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
