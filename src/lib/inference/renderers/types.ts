import { ModelMetadata, PlaygroundParams, ParsedResult } from '@/types/playground';

export interface RenderOptions {
  ctx: CanvasRenderingContext2D;
  result: ParsedResult;
  params: PlaygroundParams;
  metadata: ModelMetadata;
  canvasWidth: number;
  canvasHeight: number;
  protoData?: Float32Array | null;
  protoShape?: number[];
  /** The original frame, needed by background removal to composite against. */
  mediaSource?: HTMLVideoElement | HTMLImageElement;
}

/**
 * Draws a ParsedResult onto the canvas.
 * Each task_type (object-detection, pose-estimation, etc.) implements this interface.
 */
export interface TaskRenderer {
  render(options: RenderOptions): void;
}
