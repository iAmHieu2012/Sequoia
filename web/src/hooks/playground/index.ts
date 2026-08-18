"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCamera } from './useCamera';
import { useModelLoader } from './useModelLoader';
import { useInference } from './useInference';
import { usePlaygroundParams } from './usePlaygroundParams';
import { useTelemetry } from './useTelemetry';

import { useImageUpload } from './useImageUpload';

export function usePlayground(modelId: string) {
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { model, loading, booting, compiledModelRef, compiledModelReady } = useModelLoader(modelId, setLogs);
  
  const metadata = model?.metadata || null;
  const { params, paramsRef, updateParam, resetParams } = usePlaygroundParams(metadata);
  const { telemetry, updateFrame, setDetectionCount } = useTelemetry();
  const { fileUrl, fileType, handleUpload, clearUpload } = useImageUpload();
  
  useCamera(cameraActive, setLogs, videoRef);

  useInference({
    videoRef,
    canvasRef,
    compiledModelRef,
    model,
    metadata,
    cameraActive,
    booting,
    compiledModelReady,
    paramsRef,
    onFrame: updateFrame,
    onDetectionCount: setDetectionCount,
    setLogs,
    fileUrl,
    fileType
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
    metadata,
    loading,
    booting,
    logs,
    cameraActive,
    setCameraActive,
    params,
    updateParam,
    resetParams,
    telemetry,
    videoRef,
    canvasRef,
    handleEscape,
    fileUrl,
    fileType,
    handleUpload,
    clearUpload
  };
}
