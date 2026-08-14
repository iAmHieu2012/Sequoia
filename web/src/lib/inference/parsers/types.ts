import { ModelMetadata, PlaygroundParams, ParsedResult } from '@/types/playground';

/**
 * OutputParser: chịu trách nhiệm parse raw tensor → ParsedResult.
 * Mỗi output_format (yolo_v8, ssd, efficientdet, ...) có implementation riêng.
 */
export interface OutputParser {
  parse(
    rawData: Float32Array,
    shape: number[],
    taskType: string,
    params: PlaygroundParams,
    metadata: ModelMetadata,
    scaleX: number,
    scaleY: number,
    protoData?: Float32Array | null,
    protoShape?: number[]
  ): ParsedResult;
}
