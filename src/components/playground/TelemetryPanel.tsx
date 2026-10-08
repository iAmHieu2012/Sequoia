import { Activity, Box } from "lucide-react";
import CyberPanel from "@/components/ui/CyberPanel";
import { PlaygroundTelemetry, ModelMetadata } from "@/types/playground";
import { AiModel } from "@/types/playground";

interface TelemetryPanelProps {
  /** The live telemetry data (fps, inference time, etc) from the inference hook */
  telemetry: PlaygroundTelemetry;
  /** Whether the camera feed is currently active and processing */
  cameraActive: boolean;
  /** The loaded metadata for the current model */
  metadata: ModelMetadata | null;
  /** The active AI model configuration */
  model: AiModel;
  className?: string;
}

/**
 * A cyberpunk-themed monitoring panel displaying live runtime statistics 
 * such as FPS, memory usage, and inference latencies.
 */

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
  };
}

export default function TelemetryPanel({ telemetry, cameraActive, metadata, model, className = '' }: TelemetryPanelProps) {
  const memUsed = typeof performance !== 'undefined' && (performance as PerformanceWithMemory).memory
    ? String(Math.round((performance as PerformanceWithMemory).memory!.usedJSHeapSize / 1048576))
    : 'N/A';

  return (
    <CyberPanel variant="outline" chamfer="tl-br" decorations="brackets" className={`bg-transparent border-white/10 relative p-4 flex flex-col gap-4 shrink-0 ${className}`}>
      <div className="text-xs font-mono text-white/40 tracking-widest uppercase border-b border-white/10 pb-2">
        TELEMETRY
      </div>
      
      <TelemetryRow label="FPS" value={cameraActive ? String(telemetry.fps) : '--'} icon={<Activity className="w-3 h-3 text-white/40" />} />
      <TelemetryRow label="INFERENCE" value={cameraActive ? String(telemetry.inferenceTime) : '--'} unit="ms" />
      <TelemetryRow label="AVG_INFERENCE" value={cameraActive ? String(telemetry.avgInferenceTime) : '--'} unit="ms" />
      <TelemetryRow label="ENTITIES" value={cameraActive ? String(telemetry.detectionCount) : '--'} icon={<Box className="w-3 h-3 text-white/40" />} />
      <TelemetryRow label="INPUT_RES" value={metadata ? `[${metadata.input_size.join(', ')}]` : '--'} />
      <TelemetryRow label="MODEL_SIZE" value={model.file_size_bytes ? `${(model.file_size_bytes / 1048576).toFixed(1)}` : 'N/A'} unit="MB" />
      <TelemetryRow label="MEMORY" value={cameraActive ? memUsed : '--'} unit="MB" />
    </CyberPanel>
  );
}

function TelemetryRow({ label, value, unit, icon }: { label: string; value: string; unit?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs font-mono text-white/40 tracking-widest">{label}</span>
      <span className="text-sm font-mono text-white tracking-widest flex items-center gap-1">
        {value} {unit && <span className="text-xs text-white/40">{unit}</span>} {icon}
      </span>
    </div>
  );
}
