import { useCallback, useEffect, useRef, Dispatch, SetStateAction, RefObject } from 'react';
import { CompiledModel, Tensor } from '@litertjs/core';
import { getParser, getRenderer } from "@/lib/inference/registry";
import { AiModel, ModelMetadata, PlaygroundParams } from '@/types/playground';

interface UseInferenceProps {
  /** Reference to the video or image HTML element acting as the input source */
  videoRef: RefObject<HTMLVideoElement | HTMLImageElement | null>;
  /** Reference to the overlay canvas where results (boxes, masks) are drawn */
  canvasRef: RefObject<HTMLCanvasElement | null>;
  /** Reference to the loaded and compiled LiteRT WebAssembly model */
  compiledModelRef: RefObject<CompiledModel | null>;
  /** The current active AI model data */
  model: AiModel | null;
  /** The metadata containing model specs (input size, normalization, etc) */
  metadata: ModelMetadata | null;
  /** True if the camera is currently active */
  cameraActive: boolean;
  /** True if the model is still running its boot sequence */
  booting: boolean;
  /** True when the model is fully compiled and ready to accept tensors */
  compiledModelReady: boolean;
  /** Reference to the dynamic parameters (Confidence, IOU, etc) */
  paramsRef: RefObject<PlaygroundParams>;
  /** Callback fired every frame with the inference time (ms) */
  onFrame: (inferenceTimeMs: number) => void;
  /** Callback fired every frame with the number of detections/objects found */
  onDetectionCount: (count: number) => void;
  /** State setter to push system logs to the playground terminal */
  setLogs: Dispatch<SetStateAction<string[]>>;
  /** URL of the uploaded static file (if any) */
  fileUrl?: string | null;
  /** Type of the uploaded file */
  fileType?: 'image' | 'video' | null;
}

/**
 * The core Inference Engine hook. 
 * Responsibilities:
 * 1. Captures frames from the Video/Image source.
 * 2. Pre-processes the frame (Resizing, Normalization, RGB/BGR swap) into a Float32 Tensor.
 * 3. Executes the LiteRT WebAssembly compiled model.
 * 4. Passes raw output tensors to the Parser (to extract boxes/masks) and Renderer (to draw on Canvas).
 */
export function useInference({
  videoRef,
  canvasRef,
  compiledModelRef,
  model,
  metadata,
  cameraActive,
  booting,
  compiledModelReady,
  paramsRef,
  onFrame,
  onDetectionCount,
  setLogs,
  fileUrl,
  fileType
}: UseInferenceProps) {
  const requestRef = useRef<number | undefined>(undefined);
  
  const workerCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const floatBufferRef = useRef<Float32Array | null>(null);
  const firstFrameLoggedRef = useRef(false);

  // Use refs for values accessed inside the render loop to avoid stale closures
  const modelRef = useRef<AiModel | null>(null);
  const metadataRef = useRef<ModelMetadata | null>(null);
  const cameraActiveRef = useRef(false);
  const fileUrlRef = useRef<string | null>(null);
  const fileTypeRef = useRef<'image' | 'video' | null>(null);

  // Keep refs in sync with state
  useEffect(() => { modelRef.current = model; }, [model]);
  useEffect(() => { metadataRef.current = metadata; }, [metadata]);
  useEffect(() => { 
    cameraActiveRef.current = cameraActive; 
    firstFrameLoggedRef.current = false;
    if (cameraActive) setLogs(prev => [...prev, "> SWITCHED TO CAMERA STREAM. WARMING UP..."]);
  }, [cameraActive, setLogs]);
  
  useEffect(() => { 
    fileUrlRef.current = fileUrl || null; 
    if (fileUrl) {
      firstFrameLoggedRef.current = false;
      setLogs(prev => [...prev, "> LOADED STATIC MEDIA. WARMING UP..."]);
    }
  }, [fileUrl, setLogs]);
  
  useEffect(() => { fileTypeRef.current = fileType || null; }, [fileType]);

  const processFrame = useCallback(async () => {
    const mediaSource = videoRef.current;
    const displayCanvas = canvasRef.current;
    const compiledModel = compiledModelRef.current;
    const currentModel = modelRef.current;
    
    // Only run if we have a media source AND we are either in camera mode or have an uploaded file
    const isActive = cameraActiveRef.current || fileUrlRef.current;
    if (!mediaSource || !displayCanvas || !compiledModel || !isActive || !currentModel) return;
    
    if (mediaSource instanceof HTMLVideoElement && mediaSource.readyState < 2) {
      requestRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const start = performance.now();
    const inputDetails = compiledModel.getInputDetails()[0];
    const shape = inputDetails.shape;
    
    let height: number, width: number;
    let isNCHW = false;

    if (metadataRef.current?.input_layout) {
      isNCHW = metadataRef.current.input_layout === 'nchw';
      height = isNCHW ? shape[2] : shape[1];
      width = isNCHW ? shape[3] : shape[2];
    } else {
      if (shape[1] === 3 || shape[1] === 1) {
        isNCHW = true;
        height = shape[2];
        width = shape[3];
      } else {
        height = shape[1];
        width = shape[2];
      }
    }

    if (!workerCtxRef.current || workerCtxRef.current.canvas.width !== width) {
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      workerCtxRef.current = offscreen.getContext('2d', { willReadFrequently: true });
      setLogs(prev => [...prev, `> ALLOCATED TENSOR BUFFER [${width}x${height}x3]...`]);
      firstFrameLoggedRef.current = false; // Reset first frame tracker when buffer changes
    }
    
    const ctx = workerCtxRef.current;
    if (!ctx) return;
    
    ctx.drawImage(mediaSource, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    
    if (!floatBufferRef.current || floatBufferRef.current.length !== width * height * 3) {
      floatBufferRef.current = new Float32Array(width * height * 3);
    }
    const float32Data = floatBufferRef.current;

    const mean = currentModel?.metadata?.normalize?.mean || [0, 0, 0];
    const std = currentModel?.metadata?.normalize?.std || [1, 1, 1];
    const isBGR = currentModel?.metadata?.color_space === 'bgr';
    
    // Default to 1/255.0 scaling (0-1), unless the model metadata specifies a custom scale
    let scale = 1 / 255.0;
    if (currentModel?.metadata?.normalize && 'scale' in currentModel.metadata.normalize) {
      scale = Number((currentModel.metadata.normalize as Record<string, unknown>).scale);
    }

    if (isNCHW) {
      const planeSize = width * height;
      for (let i = 0, p = 0; i < imageData.data.length; i += 4, p++) {
        let r = imageData.data[i];
        const g = imageData.data[i + 1];
        let b = imageData.data[i + 2];
        if (isBGR) { const tmp = r; r = b; b = tmp; }
        
        const vr = r * scale;
        const vg = g * scale;
        const vb = b * scale;

        float32Data[p] = (vr - mean[0]) / std[0];
        float32Data[planeSize + p] = (vg - mean[1]) / std[1];
        float32Data[planeSize * 2 + p] = (vb - mean[2]) / std[2];
      }
    } else {
      for (let i = 0, j = 0; i < imageData.data.length; i += 4, j += 3) {
        let r = imageData.data[i];
        const g = imageData.data[i + 1];
        let b = imageData.data[i + 2];
        if (isBGR) { const tmp = r; r = b; b = tmp; }

        const vr = r * scale;
        const vg = g * scale;
        const vb = b * scale;

        float32Data[j] = (vr - mean[0]) / std[0];
        float32Data[j + 1] = (vg - mean[1]) / std[1];
        float32Data[j + 2] = (vb - mean[2]) / std[2];
      }
    }

    const inputTensor = Tensor.fromTypedArray(float32Data, shape);

    try {
      const outputs = await compiledModel.run([inputTensor]);
      
      if (!firstFrameLoggedRef.current) {
        setLogs(prev => [...prev, "> INFERENCE PIPELINE ACTIVE. STREAMING TENSORS..."]);
        firstFrameLoggedRef.current = true;
      }

      try {
        if (!canvasRef.current || !outputs || outputs.length === 0) return;
        
        const inferenceTimeMs = performance.now() - start;
        onFrame(inferenceTimeMs);
        
        let outTensor = outputs[0];
        let pTensor = outputs.length > 1 ? outputs[1] : null;
        
        if (outputs.length > 1) {
          const dim0 = outputs[0].type.layout.dimensions;
          const dim1 = outputs[1].type.layout.dimensions;
          if (dim0.length === 4 && dim1.length === 3) {
            pTensor = outputs[0];
            outTensor = outputs[1];
          } else if (dim1.length === 4 && dim0.length === 3) {
            outTensor = outputs[0];
            pTensor = outputs[1];
          }
        }

        const outData = (await outTensor.data()) as Float32Array;
        const outShape = Array.from(outTensor.type.layout.dimensions);
        
        let protoData: Float32Array | null = null;
        let protoShape: number[] = [];
        if (pTensor) {
          protoData = (await pTensor.data()) as Float32Array;
          protoShape = Array.from(pTensor.type.layout.dimensions);
        }
        
        const mw = mediaSource instanceof HTMLVideoElement ? mediaSource.videoWidth : (mediaSource as HTMLImageElement).naturalWidth;
        const mh = mediaSource instanceof HTMLVideoElement ? mediaSource.videoHeight : (mediaSource as HTMLImageElement).naturalHeight;
        
        displayCanvas.width = mw || 640;
        displayCanvas.height = mh || 640;
        const dCtx = displayCanvas.getContext('2d');
        
        if (dCtx && metadataRef.current && currentModel) {
          dCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);

          const scaleX = displayCanvas.width / width;
          const scaleY = displayCanvas.height / height;
          
          const parser = getParser(metadataRef.current.output_format);
          const renderer = getRenderer(metadataRef.current.task);
          
            const task = metadataRef.current.task;
            const isReplacementTask = 
              ['image-to-image', 'style-transfer', 'depth-estimation', 'super-resolution'].includes(task) || 
              (task === 'image-segmentation' && metadataRef.current.visualization.type === 'background_removal');
            
            if (mediaSource instanceof HTMLElement) {
              mediaSource.style.opacity = isReplacementTask ? '0' : '1';
            }

            if (parser && renderer) {
              const result = parser.parse({
                rawData: outData, 
                shape: outShape, 
                taskType: metadataRef.current.task, 
                params: paramsRef.current, 
                metadata: metadataRef.current,
                scaleX, 
                scaleY, 
                protoData, 
                protoShape
              });
              
              renderer.render({
                ctx: dCtx, 
                result, 
                params: paramsRef.current, 
                metadata: metadataRef.current,
                canvasWidth: displayCanvas.width, 
                canvasHeight: displayCanvas.height, 
                protoData, 
                protoShape, 
                mediaSource
              });
              
              onDetectionCount(result.count);
            }
        }
      } finally {
        for (const out of outputs) out.delete();
      }
    } catch (error) {
      console.error("Inference Error:", error);
      setLogs(prev => {
        if (prev[prev.length - 1] === "> CRITICAL: TENSOR PROCESSING FAILED.") return prev;
        return [...prev, "> CRITICAL: TENSOR PROCESSING FAILED."];
      });
    } finally {
      inputTensor.delete();
    }
    
    requestRef.current = requestAnimationFrame(processFrame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (compiledModelReady && (cameraActive || fileUrl) && !booting) {
      requestRef.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [compiledModelReady, cameraActive, fileUrl, booting, processFrame]);

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
