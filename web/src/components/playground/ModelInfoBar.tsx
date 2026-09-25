import { Cpu } from "lucide-react";
import { AiModel } from "@/types/playground";
import UniversalHeader from "@/components/ui/UniversalHeader";

interface ModelInfoBarProps {
  /** The currently active AI Model being run in the playground */
  model: AiModel;
  /** True if the inference engine is still initializing/compiling the model */
  booting: boolean;
  /** Callback to exit the playground and return to the dashboard */
  handleEscape: () => void;
}

/**
 * Top navigation bar for the Playground. 
 * Displays the current active model, its task type, and the engine status.
 */
export default function ModelInfoBar({ model, booting, handleEscape }: ModelInfoBarProps) {
  const taskTypeBlock = (
    <div className="flex flex-col items-end">
      <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">TASK_TYPE</span>
      <span className="text-xs font-mono text-system tracking-widest uppercase bg-system/10 px-2 py-0.5 border border-system/20">
        {model.task_type.replace(/_/g, ' ')}
      </span>
    </div>
  );

  return (
    <UniversalHeader 
      onBack={handleEscape}
      backLabel="ABORT_RUNTIME"
      subtitle="ACTIVE_MODEL"
      title={model.name}
      titleIcon={<Cpu className="w-4 h-4 text-system" />}
      statusLabel={booting ? 'INITIALIZING' : 'ONLINE'}
      statusActive={!booting}
      extraRight={taskTypeBlock}
    />
  );
}
