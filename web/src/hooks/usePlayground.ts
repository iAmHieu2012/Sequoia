"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loadLiteRt, loadAndCompile, CompiledModel, Tensor } from '@litertjs/core';
import { renderClassification } from "@/lib/inference/classification";
import { parseYoloBoxes } from "@/lib/inference/yoloUtils";
import { renderDetection } from "@/lib/inference/detection";
import { renderPose } from "@/lib/inference/pose";
import { renderSegmentation } from "@/lib/inference/segmentation";

export interface AiModel {
  id: string;
  name: string;
  description: string;
  taskType: string;
  fileUrl: string;
  metadataUrl: string;
  version: string;
  format: string;
  labels?: string[];
  inputSize?: number[];
}

export function usePlayground(modelId: string) {
  const router = useRouter();
  const [model, setModel] = useState<AiModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [booting, setBooting] = useState(true);
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
  const compiledModelRef = useRef<CompiledModel | null>(null);
  const [compiledModelReady, setCompiledModelReady] = useState(false);

  // Use refs for values accessed inside the render loop to avoid stale closures
  const modelRef = useRef<AiModel | null>(null);
  const cameraActiveRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Keep refs in sync with state
  useEffect(() => { modelRef.current = model; }, [model]);
  useEffect(() => { cameraActiveRef.current = cameraActive; }, [cameraActive]);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    fetch(`/api/v1/models/${modelId}`)
      .then(res => res.json())
      .then(async data => {
        const modelData = data.data;
        if (modelData.metadataUrl) {
          try {
            const metaRes = await fetch(modelData.metadataUrl);
            const metaJson = await metaRes.json();
            modelData.labels = metaJson.labels;
            modelData.inputSize = metaJson.input_size;
          } catch (e) {
            console.warn("Failed to fetch metadata.json from CDN", e);
          }
        }
        setModel(modelData);
        setLoading(false);
        simulateBootSequence(modelData);
      })
      .catch(err => {
        console.error(err);
        setLogs(prev => [...prev, "> ERROR: FAILED TO FETCH MODEL MATRIX."]);
        setLoading(false);
      });
  }, [modelId]);

  const requestRef = useRef<number | undefined>(undefined);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const framesCountRef = useRef<number>(0);
  
  const workerCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const floatBufferRef = useRef<Float32Array | null>(null);

  const processFrame = useCallback(async () => {
    const video = videoRef.current;
    const displayCanvas = canvasRef.current;
    const compiledModel = compiledModelRef.current;
    const currentModel = modelRef.current;
    
    if (!video || !displayCanvas || !compiledModel || !cameraActiveRef.current || !currentModel) return;
    
    if (video.readyState < 2) {
      requestRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const start = performance.now();
    const inputDetails = compiledModel.getInputDetails()[0];
    const shape = inputDetails.shape;
    
    let height: number, width: number;
    let isNCHW = false;
    if (shape[1] === 3) {
      isNCHW = true;
      height = shape[2];
      width = shape[3];
    } else {
      height = shape[1];
      width = shape[2];
    }

    if (!workerCtxRef.current || workerCtxRef.current.canvas.width !== width) {
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      workerCtxRef.current = offscreen.getContext('2d', { willReadFrequently: true });
    }
    
    const ctx = workerCtxRef.current;
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    
    if (!floatBufferRef.current || floatBufferRef.current.length !== width * height * 3) {
      floatBufferRef.current = new Float32Array(width * height * 3);
    }
    const float32Data = floatBufferRef.current;

    if (isNCHW) {
      const planeSize = width * height;
      for (let i = 0, p = 0; i < imageData.data.length; i += 4, p++) {
        float32Data[p] = imageData.data[i] / 255.0;
        float32Data[planeSize + p] = imageData.data[i + 1] / 255.0;
        float32Data[planeSize * 2 + p] = imageData.data[i + 2] / 255.0;
      }
    } else {
      for (let i = 0, j = 0; i < imageData.data.length; i += 4, j += 3) {
        float32Data[j] = imageData.data[i] / 255.0;
        float32Data[j + 1] = imageData.data[i + 1] / 255.0;
        float32Data[j + 2] = imageData.data[i + 2] / 255.0;
      }
    }

    const inputTensor = Tensor.fromTypedArray(float32Data, shape);

    try {
      const outputs = await compiledModel.run([inputTensor]);
      
      // Guard: component may have unmounted during await
      if (!canvasRef.current) {
        inputTensor.delete();
        for (const out of outputs) out.delete();
        return;
      }
      
      const inferenceTimeMs = performance.now() - start;
      setInferenceTime(Math.round(inferenceTimeMs));
      
      framesCountRef.current++;
      const now = performance.now();
      if (now - lastFrameTimeRef.current >= 1000) {
        setFps(framesCountRef.current);
        framesCountRef.current = 0;
        lastFrameTimeRef.current = now;
      }
      
      inputTensor.delete();
      
      let outTensor = outputs[0];
      let protoTensor = outputs.length > 1 ? outputs[1] : null;
      
      if (outputs.length > 1) {
        const dim0 = outputs[0].type.layout.dimensions;
        const dim1 = outputs[1].type.layout.dimensions;
        if (dim0.length === 4 && dim1.length === 3) {
          protoTensor = outputs[0];
          outTensor = outputs[1];
        } else if (dim1.length === 4 && dim0.length === 3) {
          outTensor = outputs[0];
          protoTensor = outputs[1];
        }
      }

      const outData = (await outTensor.data()) as Float32Array;
      const outShape = Array.from(outTensor.type.layout.dimensions);
      
      let protoData: Float32Array | null = null;
      let protoShape: number[] = [];
      if (protoTensor) {
        protoData = (await protoTensor.data()) as Float32Array;
        protoShape = Array.from(protoTensor.type.layout.dimensions);
      }
      
      displayCanvas.width = video.videoWidth || 640;
      displayCanvas.height = video.videoHeight || 640;
      const dCtx = displayCanvas.getContext('2d');
      
      if (dCtx) {
        dCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
        
        dCtx.fillStyle = 'rgba(0, 240, 255, 0.5)';
        dCtx.font = '10px monospace';
        dCtx.fillText(`// TENSOR SHAPE: ${outShape.join('x')}`, 10, 20);

        const scaleX = displayCanvas.width / width;
        const scaleY = displayCanvas.height / height;
        const currentThreshold = thresholdRef.current / 100.0;
        const currentIou = iouThresholdRef.current / 100.0;

        if (currentModel.taskType === 'image_classification' && outShape.length >= 2) {
          renderClassification(dCtx, outData, outShape, currentModel.labels || [], displayCanvas.width);
        } 
        else if (outShape.length === 3) {
          const { boxes, numClasses } = parseYoloBoxes(
            outData, outShape, currentModel.taskType, currentThreshold, currentIou,
            width, height, scaleX, scaleY
          );

          for (const b of boxes) {
            // Segmentation masks render first (underneath boxes/text)
            if (currentModel.taskType === 'instance_segmentation' && b.maskCoeffs && protoData) {
              renderSegmentation(dCtx, b, protoData, protoShape, displayCanvas.width, displayCanvas.height);
            }
            
            if (currentModel.taskType === 'pose_estimation') {
              renderPose(dCtx, b);
            } else {
              renderDetection(dCtx, b, numClasses, currentModel.labels);
            }
          }
        }
      }

      for (const out of outputs) {
        out.delete();
      }
    } catch (e) {
      console.error("Inference Error:", e);
      inputTensor.delete();
    }
    
    requestRef.current = requestAnimationFrame(processFrame);
  }, []); // All mutable values accessed via refs — no stale closures

  // Start/stop inference loop
  useEffect(() => {
    if (compiledModelReady && cameraActive && !booting) {
      requestRef.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [compiledModelReady, cameraActive, booting, processFrame]);

  const simulateBootSequence = (loadedModelData: AiModel) => {
    const sequence = [
      "> ALLOCATING TENSORS...",
      "> LOADING WEIGHTS...",
      "> WARMING UP NEURAL ENGINE...",
      "> RUNTIME ESTABLISHED. STANDBY."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLogs(prev => [...prev, sequence[i]]);
      i++;
      if (i >= sequence.length) {
        clearInterval(interval);
        setTimeout(() => {
          setBooting(false);
          initLiteRtModel(loadedModelData);
        }, 500);
      }
    }, 600);
  };

  const initLiteRtModel = async (modelData: AiModel) => {
    try {
      setLogs(prev => [...prev, "> INITIALIZING LiteRT WASM ENGINE..."]);
      try {
        await loadLiteRt("https://cdn.jsdelivr.net/npm/@litertjs/core@2.5.3/wasm/");
      } catch (err: any) {
        if (!err.message?.includes("already loading") && !err.message?.includes("already loaded")) {
           throw err;
        }
      }
      
      setLogs(prev => [...prev, "> DOWNLOADING MODEL DATA..."]);
      
      const loadedModel = await loadAndCompile(modelData.fileUrl);
      compiledModelRef.current = loadedModel;
      setCompiledModelReady(true);
      
      setLogs(prev => [...prev, "> MODEL COMPILED SUCCESSFULLY."]);
    } catch (err: any) {
      console.error(err);
      setLogs(prev => [...prev, "> ERROR: LiteRT COMPILE FAILED."]);
    }
  };

  // Camera lifecycle — start stream & clean up on deactivation
  useEffect(() => {
    if (cameraActive && videoRef.current) {
      setLogs(prev => [...prev, "> ENGAGING OPTICAL SENSOR..."]);
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setLogs(prev => [...prev, "> CAMERA UPLINK STABLE."]);
          }
        })
        .catch(err => {
          console.error("Camera error:", err);
          setLogs(prev => [...prev, "> ERROR: FAILED TO ACCESS OPTICAL SENSOR."]);
        });
    }
    
    // Cleanup: stop all tracks when camera deactivated or component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [cameraActive]);

  // Full cleanup on unmount: release model memory + cancel animation frame
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (compiledModelRef.current) {
        try { compiledModelRef.current.delete(); } catch { /* already freed */ }
        compiledModelRef.current = null;
      }
    };
  }, []);

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
