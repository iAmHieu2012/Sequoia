import { Activity, Box } from "lucide-react";
import CyberBrackets from "@/components/ui/CyberBrackets";
import { PlaygroundTelemetry, ModelMetadata, AiModel } from "@/types/playground";

interface TelemetryPanelProps {
  telemetry: PlaygroundTelemetry;
  cameraActive: boolean;
  metadata: ModelMetadata | null;
  model: AiModel;
}

export default function TelemetryPanel({ telemetry, cameraActive, metadata, model }: TelemetryPanelProps) {
  const memUsed = typeof performance !== 'undefined' && (performance as any).memory
    ? String(Math.round((performance as any).memory.usedJSHeapSize / 1048576))
    : 'N/A';

  return (
    <div className="bg-black/60 border border-panel-border relative p-4 flex flex-col gap-4 shrink-0">
      <CyberBrackets color="border-system/30" />
      <div className="text-[10px] font-mono text-text-dim tracking-widest uppercase border-b border-panel-border pb-2">
        TELEMETRY
      </div>
      
      <TelemetryRow label="FPS" value={cameraActive ? String(telemetry.fps) : '--'} icon={<Activity className="w-3 h-3 text-system" />} />
      <TelemetryRow label="INFERENCE" value={cameraActive ? String(telemetry.inferenceTime) : '--'} unit="ms" />
      <TelemetryRow label="AVG_INFERENCE" value={cameraActive ? String(telemetry.avgInferenceTime) : '--'} unit="ms" />
      <TelemetryRow label="DETECTIONS" value={cameraActive ? String(telemetry.detectionCount) : '--'} icon={<Box className="w-3 h-3 text-system" />} />
      <TelemetryRow label="INPUT_RES" value={metadata ? `${metadata.input_size[0]}×${metadata.input_size[1]}` : '--'} />
      <TelemetryRow label="MODEL_SIZE" value={model.file_size_bytes ? `${(model.file_size_bytes / 1048576).toFixed(1)}` : 'N/A'} unit="MB" />
      <TelemetryRow label="MEMORY" value={cameraActive ? memUsed : '--'} unit="MB" />
    </div>
  );
}

function TelemetryRow({ label, value, unit, icon }: { label: string; value: string; unit?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-mono text-text-dim tracking-widest">{label}</span>
      <span className="text-sm font-mono text-white tracking-widest flex items-center gap-1">
        {value} {unit && <span className="text-[9px] text-system">{unit}</span>} {icon}
      </span>
    </div>
  );
}
