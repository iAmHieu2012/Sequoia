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

  const lastFrameTimeRef = useRef<number>(performance.now());
  const framesCountRef = useRef<number>(0);
  const inferenceTimesRef = useRef<number[]>([]);

  const updateFrame = useCallback((inferenceTimeMs: number) => {
    framesCountRef.current++;
    inferenceTimesRef.current.push(inferenceTimeMs);
    if (inferenceTimesRef.current.length > 30) {
      inferenceTimesRef.current.shift();
    }

    const avgInferenceTime = inferenceTimesRef.current.reduce((a, b) => a + b, 0) / inferenceTimesRef.current.length;

    const now = performance.now();
    if (now - lastFrameTimeRef.current >= 1000) {
      const fps = framesCountRef.current;
      framesCountRef.current = 0;
      lastFrameTimeRef.current = now;

      setTelemetry(prev => ({
        ...prev,
        fps,
        inferenceTime: Math.round(inferenceTimeMs),
        avgInferenceTime: Math.round(avgInferenceTime),
      }));
    } else {
      setTelemetry(prev => ({
        ...prev,
        inferenceTime: Math.round(inferenceTimeMs),
        avgInferenceTime: Math.round(avgInferenceTime),
      }));
    }
  }, []);

  const setDetectionCount = useCallback((count: number) => {
    setTelemetry(prev => ({ ...prev, detectionCount: count }));
  }, []);

  return { telemetry, updateFrame, setDetectionCount };
}
