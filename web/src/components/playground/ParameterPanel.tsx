import { RotateCcw } from 'lucide-react';
import CyberPanel from '@/components/ui/CyberPanel';
import InputSourceSelector from './InputSourceSelector';
import { ParameterDefinition, ParamValue } from '@/types/playground';

interface ParameterPanelProps {
  /** Array of parameter definitions parsed directly from the model's metadata */
  paramDefs: ParameterDefinition[];
  /** The current key-value state of all parameters */
  playgroundParams: Record<string, ParamValue>;
  /** Callback to update a specific parameter by key */
  updateParam: (key: string, value: ParamValue) => void;
  /** Callback to reset all parameters to their default values */
  resetParams: () => void;
  /** True if the camera feed is currently active */
  cameraActive: boolean;
  /** True if the AI model is still initializing */
  booting: boolean;
  /** Callback to toggle between camera and image upload modes */
  setCameraActive: (active: boolean) => void;
  /** Modes supported by the active model (e.g., ['camera', 'image']) */
  supportedModes?: ('camera' | 'image')[];
}

/**
 * A dynamic control panel that generates UI sliders and toggles based on 
 * the AI model's metadata. Allows users to tweak inference parameters 
 * (like Confidence Threshold, IOU, etc.) in real-time.
 */

export default function ParameterPanel({
  paramDefs,
  playgroundParams,
  updateParam,
  resetParams,
  cameraActive,
  booting,
  setCameraActive,
  supportedModes
}: ParameterPanelProps) {
  return (
    <CyberPanel variant="outline" chamfer="tl-br" decorations="brackets" className="w-64 bg-transparent border-white/10 relative flex flex-col p-4 shrink-0 hidden lg:flex">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4">
        <div className="text-xs font-mono text-white/40 tracking-widest uppercase">
          PARAMETERS
        </div>
        <button
          onClick={resetParams}
          className="text-xs font-mono text-white/40 hover:text-white tracking-widest uppercase flex items-center gap-1 transition-colors"
          title="Reset all parameters to defaults"
        >
          <RotateCcw className="w-3 h-3" />
          RESET
        </button>
      </div>
      
      <div className="flex flex-col gap-6">
        <InputSourceSelector 
          cameraActive={cameraActive} 
          booting={booting} 
          setCameraActive={setCameraActive} 
          supportedModes={supportedModes}
        />

        {paramDefs.map((paramDef) => (
          <DynamicParameter
            key={paramDef.key}
            definition={paramDef}
            value={playgroundParams[paramDef.key]}
            onChange={(val) => updateParam(paramDef.key, val)}
          />
        ))}
      </div>
    </CyberPanel>
  );
}

function DynamicParameter({ definition, value, onChange }: { 
  definition: ParameterDefinition; 
  value: ParamValue | undefined;
  onChange: (val: ParamValue) => void;
}) {
  if (definition.type === 'slider') {
    const numVal = (value as number) ?? (definition.default as number);
    const isPercent = definition.max === 1.0 && definition.step !== undefined && definition.step < 1;
    const displayVal = isPercent ? `${(numVal * 100).toFixed(0)}%` : String(numVal);

    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end">
          <span className="text-xs font-mono text-white/40 tracking-widest uppercase">{definition.label.replace(/\s/g, '_')}</span>
          <span className="text-xs font-mono text-white font-bold">{displayVal}</span>
        </div>
        <input 
          type="range" 
          min={definition.min}
          max={definition.max}
          step={definition.step}
          value={numVal}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1 bg-white/10 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.8)]"
        />
      </div>
    );
  }

  if (definition.type === 'toggle') {
    const boolVal = (value as boolean) ?? (definition.default as boolean);
    return (
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono text-white/40 tracking-widest uppercase">{definition.label.replace(/\s/g, '_')}</span>
        <button
          onClick={() => onChange(!boolVal)}
          className={`w-10 h-5 border relative transition-all duration-300 ${
            boolVal 
              ? 'border-white/40 bg-white/10 shadow-[0_0_8px_rgba(255,255,255,0.2)]' 
              : 'border-white/10 bg-transparent'
          }`}
        >
          <div className={`absolute top-0.5 w-3.5 h-3.5 transition-all duration-300 ${
            boolVal 
              ? 'right-0.5 bg-white' 
              : 'left-0.5 bg-white/40'
          }`} />
        </button>
      </div>
    );
  }

  return null;
}
