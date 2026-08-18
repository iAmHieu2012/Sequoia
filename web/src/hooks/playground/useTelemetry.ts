"use client";

import { useState, useCallback, useRef } from 'react';
import { PlaygroundTelemetry } from '@/types/playground';

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<PlaygroundTelemetry>({
    fps: 0,
    inferenceTime: 0,
    avgInferenceTime: 0,
    detectionCount: 0,
    memoryUsageMB: null,
    inputResolution: '0x0',
    modelSizeBytes: 0,
  });

  const lastUpdateTimeRef = useRef<number>(0);
  const framesCountRef = useRef<number>(0);
  const inferenceTimesRef = useRef<number[]>([]);
  const detectionCountRef = useRef<number>(0);

  const updateFrame = useCallback((inferenceTimeMs: number) => {
    framesCountRef.current++;
    inferenceTimesRef.current.push(inferenceTimeMs);
    if (inferenceTimesRef.current.length > 30) {
      inferenceTimesRef.current.shift();
    }

    const now = performance.now();
    if (lastUpdateTimeRef.current === 0) lastUpdateTimeRef.current = now;
    
    const elapsedMs = now - lastUpdateTimeRef.current;
    
    // Update UI state every 500ms to prevent React re-rendering 60 times a second
    if (elapsedMs >= 500) {
      const avgInferenceTime = inferenceTimesRef.current.reduce((a, b) => a + b, 0) / inferenceTimesRef.current.length;
      const fps = Math.round((framesCountRef.current * 1000) / elapsedMs);
      
      framesCountRef.current = 0;
      lastUpdateTimeRef.current = now;

      setTelemetry(prev => {
        const newDetectionCount = detectionCountRef.current;
        const newInferenceTime = Math.round(inferenceTimeMs);
        const newAvg = Math.round(avgInferenceTime);
        
        if (prev.fps === fps && 
            prev.detectionCount === newDetectionCount && 
            prev.inferenceTime === newInferenceTime && 
            prev.avgInferenceTime === newAvg) {
          return prev;
        }

        return {
          ...prev,
          fps,
          inferenceTime: newInferenceTime,
          avgInferenceTime: newAvg,
          detectionCount: newDetectionCount,
        };
      });
    }
  }, []);

  const setDetectionCount = useCallback((count: number) => {
    detectionCountRef.current = count;
  }, []);

  return { telemetry, updateFrame, setDetectionCount };
}
