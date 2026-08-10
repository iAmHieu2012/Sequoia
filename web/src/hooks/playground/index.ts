"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCamera } from './useCamera';
import { useModelLoader } from './useModelLoader';
import { useInference } from './useInference';

export interface AiModel {
  id: string;
  name: string;
  description: string;
  task_type: string;
  file_url: string;
  metadata_url: string;
  version: string;
  format: string;
  labels?: string[];
  inputSize?: number[];
}

export function usePlayground(modelId: string) {
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  const [threshold, setThresholdState] = useState(50);
  const thresholdRef = useRef(50);
  
  const [iouThreshold, setIouThresholdState] = useState(45);
  const iouThresholdRef = useRef(45);
  
  const setThreshold = (val: number) => {
    setThresholdState(val);
    thresholdRef.current = val;
  };
  
  const setIouThreshold = (val: number) => {
    setIouThresholdState(val);
    iouThresholdRef.current = val;
  };
  
  const [cameraActive, setCameraActive] = useState(false);
  const [fps, setFps] = useState(0);
  const [inferenceTime, setInferenceTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { model, loading, booting, compiledModelRef, compiledModelReady } = useModelLoader(modelId, setLogs);
  
  useCamera(cameraActive, setLogs, videoRef);

  useInference({
    videoRef,
    canvasRef,
    compiledModelRef,
    model,
    cameraActive,
    booting,
    compiledModelReady,
    thresholdRef,
    iouThresholdRef,
    setInferenceTime,
    setFps,
    setLogs
  });

  const handleEscape = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleEscape();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleEscape]);

  return {
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
  };
}
