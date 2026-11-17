import { ModelMetadata, PlaygroundParams, ParsedResult } from '@/types/playground';

export interface ParseOptions {
  rawData: Float32Array;
  shape: number[];
  taskType: string;
  params: PlaygroundParams;
  metadata: ModelMetadata;
  /** Factors from model input size to canvas size. */
  scaleX: number;
  scaleY: number;
  /** Second output tensor, for formats that have one (segmentation prototypes, SSD scores, SimCC Y). */
  protoData?: Float32Array | null;
  protoShape?: number[];
}

/**
 * Turns raw tensor output into a typed ParsedResult.
 * Each output_format (yolo_v8, ssd, classification, etc.) implements this interface.
 */
export interface OutputParser {
  parse(options: ParseOptions): ParsedResult;
}
