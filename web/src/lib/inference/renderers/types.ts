import { ModelMetadata, PlaygroundParams, ParsedResult } from '@/types/playground';

/**
 * TaskRenderer: chịu trách nhiệm render ParsedResult lên canvas.
 * Mỗi task_type (object-detection, pose-estimation, ...) có renderer riêng.
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
    protoShape?: number[]
  ): void;
}
