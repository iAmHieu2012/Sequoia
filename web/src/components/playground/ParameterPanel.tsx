import { RotateCcw } from 'lucide-react';
import CyberBrackets from '@/components/ui/CyberBrackets';
import InputSourceSelector from './InputSourceSelector';
import { ParameterDefinition, ParamValue } from '@/types/playground';

interface ParameterPanelProps {
  paramDefs: ParameterDefinition[];
  playgroundParams: Record<string, ParamValue>;
  updateParam: (key: string, value: ParamValue) => void;
  resetParams: () => void;
  cameraActive: boolean;
  booting: boolean;
  setCameraActive: (active: boolean) => void;
}

export default function ParameterPanel({
  paramDefs,
  playgroundParams,
  updateParam,
  resetParams,
  cameraActive,
  booting,
  setCameraActive
}: ParameterPanelProps) {
  return (
    <div className="w-64 bg-black/60 border border-panel-border relative flex flex-col p-4 shrink-0 hidden lg:flex">
      <CyberBrackets color="border-system/30" />
      <div className="flex items-center justify-between border-b border-panel-border pb-2 mb-4">
        <div className="text-[10px] font-mono text-text-dim tracking-widest uppercase">
          PARAMETERS
        </div>
        <button
          onClick={resetParams}
          className="text-[9px] font-mono text-text-dim hover:text-system tracking-widest uppercase flex items-center gap-1 transition-colors"
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
    </div>
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
          <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">{definition.label.replace(/\s/g, '_')}</span>
          <span className="text-xs font-mono text-system font-bold">{displayVal}</span>
        </div>
        <input 
          type="range" 
          min={definition.min}
          max={definition.max}
          step={definition.step}
          value={numVal}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1 bg-panel-border appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-system [&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--color-system)]"
        />
      </div>
    );
  }

  if (definition.type === 'toggle') {
    const boolVal = (value as boolean) ?? (definition.default as boolean);
    return (
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">{definition.label.replace(/\s/g, '_')}</span>
        <button
          onClick={() => onChange(!boolVal)}
          className={`w-10 h-5 border relative transition-all duration-300 ${
            boolVal 
              ? 'border-system bg-system/20 shadow-[0_0_8px_var(--color-system)]' 
              : 'border-panel-border bg-black/40'
          }`}
        >
          <div className={`absolute top-0.5 w-3.5 h-3.5 transition-all duration-300 ${
            boolVal 
              ? 'right-0.5 bg-system' 
              : 'left-0.5 bg-text-dim'
          }`} />
        </button>
      </div>
    );
  }

  return null;
}
