import { ModelMetadata, PlaygroundParams, ParsedResult } from '@/types/playground';

/**
 * TaskRenderer: Defines the contract for rendering a ParsedResult onto the canvas.
 * Each task_type (object-detection, pose-estimation, etc.) implements this interface.
 */
export interface TaskRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    result: ParsedResult,
    params: PlaygroundParams,
    metadata: ModelMetadata,
    canvasWidth: number,
    canvasHeight: number,
    protoData?: Float32Array | null,
    protoShape?: number[],
    mediaSource?: HTMLVideoElement | HTMLImageElement
  ): void;
}
