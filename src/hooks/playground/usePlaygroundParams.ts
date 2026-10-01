
import { useState, useRef, useEffect, useCallback } from 'react';
import { ModelMetadata, PlaygroundParams, ParamValue } from '@/types/playground';

/**
 * Hook to manage dynamic inference parameters (e.g., Confidence Threshold, IOU, Sliders).
 * Uses React Refs to ensure the 60fps inference loop always accesses the latest 
 * parameter values without causing expensive React re-renders.
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
