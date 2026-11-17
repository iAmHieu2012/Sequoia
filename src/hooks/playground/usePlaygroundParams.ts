
import { useState, useRef, useEffect, useCallback } from 'react';
import { ModelMetadata, PlaygroundParams, ParamValue } from '@/types/playground';

/**
 * Inference parameters set from the UI (confidence threshold, IoU, etc.).
 * `params` drives the controls; `paramsRef` mirrors it so the per-frame inference loop
 * always reads the latest values without being recreated.
 * 
 * @param metadata The loaded model's metadata containing default parameter definitions
 */
export function usePlaygroundParams(metadata: ModelMetadata | null) {
  const [params, setParams] = useState<PlaygroundParams>({});
  const paramsRef = useRef<PlaygroundParams>({});

  const initParams = useCallback((meta: ModelMetadata) => {
    const initial: PlaygroundParams = {};
    if (meta.parameters) {
      meta.parameters.forEach(p => {
        initial[p.key] = p.default;
      });
    }
    setParams(initial);
    paramsRef.current = initial;
  }, []);

  useEffect(() => {
    if (metadata) {
      // Intentional: reset to the new model's defaults whenever its metadata arrives.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      initParams(metadata);
    }
  }, [metadata, initParams]);

  const updateParam = useCallback((key: string, value: ParamValue) => {
    setParams(prev => {
      const next = { ...prev, [key]: value };
      paramsRef.current = next;
      return next;
    });
  }, []);

  const resetParams = useCallback(() => {
    if (metadata) {
      initParams(metadata);
    }
  }, [metadata, initParams]);

  return { params, paramsRef, updateParam, resetParams };
}
