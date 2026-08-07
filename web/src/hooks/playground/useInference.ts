import { useEffect, useRef, MutableRefObject, Dispatch, SetStateAction, useCallback } from 'react';
import { CompiledModel, Tensor } from '@litertjs/core';
import { renderClassification } from "@/lib/inference/classification";
import { parseYoloBoxes } from "@/lib/inference/yoloUtils";
import { renderDetection } from "@/lib/inference/detection";
import { renderPose } from "@/lib/inference/pose";
import { renderSegmentation } from "@/lib/inference/segmentation";
import { AiModel } from './index';

interface UseInferenceProps {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  compiledModelRef: MutableRefObject<CompiledModel | null>;
  model: AiModel | null;
  cameraActive: boolean;
  booting: boolean;
  compiledModelReady: boolean;
  thresholdRef: MutableRefObject<number>;
  iouThresholdRef: MutableRefObject<number>;
  setInferenceTime: Dispatch<SetStateAction<number>>;
  setFps: Dispatch<SetStateAction<number>>;
  setLogs: Dispatch<SetStateAction<string[]>>;
}

export function useInference({
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
}: UseInferenceProps) {
  const requestRef = useRef<number | undefined>(undefined);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const framesCountRef = useRef<number>(0);
  
  const workerCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const floatBufferRef = useRef<Float32Array | null>(null);
  const tensorShapeLoggedRef = useRef(false);

  // Use refs for values accessed inside the render loop to avoid stale closures
  const modelRef = useRef<AiModel | null>(null);
  const cameraActiveRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { modelRef.current = model; }, [model]);
  useEffect(() => { cameraActiveRef.current = cameraActive; }, [cameraActive]);

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
      
      try {
        // Guard: component may have unmounted during await
        if (!canvasRef.current) {
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

          if (!tensorShapeLoggedRef.current) {
            tensorShapeLoggedRef.current = true;
            setLogs(prev => [...prev, `> OUTPUT TENSOR: ${outShape.join('x')}`]);
          }

          const scaleX = displayCanvas.width / width;
          const scaleY = displayCanvas.height / height;
          const currentThreshold = thresholdRef.current / 100.0;
          const currentIou = iouThresholdRef.current / 100.0;

          if (currentModel.taskType === 'image-classification' && outShape.length >= 2) {
            renderClassification(dCtx, outData, outShape, currentModel.labels || [], displayCanvas.width);
          } 
          else if (outShape.length === 3) {
            const { boxes, numClasses } = parseYoloBoxes(
              outData, outShape, currentModel.taskType, currentThreshold, currentIou,
              width, height, scaleX, scaleY
            );

            for (const b of boxes) {
              if (currentModel.taskType === 'instance-segmentation' && b.maskCoeffs && protoData) {
                renderSegmentation(dCtx, b, protoData, protoShape, displayCanvas.width, displayCanvas.height);
              }
              
              if (currentModel.taskType === 'pose-estimation') {
                renderPose(dCtx, b);
              } else {
                renderDetection(dCtx, b, numClasses, currentModel.labels);
              }
            }
          }
        }
      } finally {
        for (const out of outputs) out.delete();
      }
    } catch (e) {
      console.error("Inference Error:", e);
    } finally {
      inputTensor.delete();
    }
    
    requestRef.current = requestAnimationFrame(processFrame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (compiledModelReady && cameraActive && !booting) {
      requestRef.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [compiledModelReady, cameraActive, booting, processFrame]);

  // Full cleanup on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (compiledModelRef.current) {
        try { compiledModelRef.current.delete(); } catch { /* already freed */ }
        compiledModelRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
