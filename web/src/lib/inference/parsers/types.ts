import { ModelMetadata, PlaygroundParams, ParsedResult } from '@/types/playground';

/**
 * OutputParser: Defines the contract for parsing raw tensor outputs into typed ParsedResult objects.
 * Each output_format (yolo_v8, ssd, classification, etc.) implements this interface.
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
