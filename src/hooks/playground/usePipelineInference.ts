import { useEffect, useRef, Dispatch, SetStateAction, RefObject } from 'react';
import { getRenderer, TaskRenderer } from '@/lib/inference/registry';
import { runPipeline, type LoadedPipeline } from '@/lib/inference/pipeline/run';
import { ModelMetadata, PlaygroundParams } from '@/types/playground';

interface UsePipelineInferenceProps {
  /** The uploaded image element (pipelines run on still images, not the camera loop). */
  videoRef: RefObject<HTMLVideoElement | HTMLImageElement | null>;
  /** Overlay canvas where the result is drawn. */
  canvasRef: RefObject<HTMLCanvasElement | null>;
  pipelineRef: RefObject<LoadedPipeline | null>;
  metadata: ModelMetadata | null;
  /** True once every stage is compiled. */
  ready: boolean;
  booting: boolean;
  /** Current parameter values; a change reruns the pipeline on the same image. */
  params: PlaygroundParams;
  fileUrl?: string | null;
  onFrame: (inferenceTimeMs: number) => void;
  onDetectionCount: (count: number) => void;
  setLogs: Dispatch<SetStateAction<string[]>>;
}

/**
 * Runs a multi-model pipeline (metadata.json `pipeline`) once per uploaded image, and again when
 * a parameter changes. Pipelines are too slow for a per-frame loop: OCR runs one recognizer pass
 * per text line. Does nothing for single-model metadata.
 */
export function usePipelineInference({
  videoRef, canvasRef, pipelineRef, metadata, ready, booting, params, fileUrl,
  onFrame, onDetectionCount, setLogs,
}: UsePipelineInferenceProps) {
  const rendererRef = useRef<{ key: string; renderer: TaskRenderer } | null>(null);
  // Incremented per run; a slower earlier run must not draw over a newer one.
  const runIdRef = useRef(0);

  useEffect(() => {
    const pipeline = pipelineRef.current;
    if (!metadata?.pipeline || !ready || booting || !fileUrl || !pipeline) return;
    const runId = ++runIdRef.current;

    (async () => {
      const image = videoRef.current;
      const canvas = canvasRef.current;
      if (!(image instanceof HTMLImageElement) || !canvas) return;
      if (!image.complete || image.naturalWidth === 0) {
        await new Promise<void>(resolve => image.addEventListener('load', () => resolve(), { once: true }));
      }
      if (runId !== runIdRef.current) return;

      const w = image.naturalWidth, h = image.naturalHeight;
      setLogs(prev => [...prev, `> RUNNING PIPELINE ON ${w}x${h} IMAGE...`]);
      try {
        const start = performance.now();
        const result = await runPipeline(pipeline, image, w, h, params);
        const elapsed = performance.now() - start;
        if (runId !== runIdRef.current) return;

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, w, h);
        if (rendererRef.current?.key !== metadata.task) {
          rendererRef.current = { key: metadata.task, renderer: getRenderer(metadata.task) };
        }
        rendererRef.current.renderer.render({
          ctx, result, params, metadata, canvasWidth: w, canvasHeight: h, mediaSource: image,
        });

        onFrame(elapsed);
        onDetectionCount(result.count);
        setLogs(prev => [...prev, `> PIPELINE DONE IN ${Math.round(elapsed)} MS: ${result.count} RESULT(S).`]);
      } catch (error) {
        console.error('Pipeline error:', error);
        setLogs(prev => [...prev, '> CRITICAL: PIPELINE FAILED.']);
      }
    })();
  }, [metadata, ready, booting, fileUrl, params, pipelineRef, videoRef, canvasRef, onFrame, onDetectionCount, setLogs]);
}
