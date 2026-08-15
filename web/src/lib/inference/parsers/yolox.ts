import { BoundingBox, ModelMetadata, PlaygroundParams, ParsedDetectionResult } from '@/types/playground';
import { OutputParser } from './types';
import { applyNMS, getLabelName } from './utils';

/**
 * Parser for YOLOX output format.
 * Output tensor layout: [batch, anchors, features]
 * Features = 4 (raw_cx, raw_cy, raw_w, raw_h) + 1 (obj_conf) + numClasses
 * Note: Boxes are NOT decoded. Must decode using strides 8, 16, 32.
 */
export class YoloxParser implements OutputParser {
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
  ): ParsedDetectionResult {
    const threshold = (params.threshold as number) ?? metadata.post_processing?.default_threshold ?? 0.25;
    const iouThreshold = (params.iou_threshold as number) ?? metadata.post_processing?.default_iou ?? 0.45;
    const maxDetections = (params.max_detections as number) ?? metadata.post_processing?.default_max_detections ?? 100;
    
    // YOLOX usually outputs [1, N, 85]
    const numAnchors = shape[1];
    const numFeatures = shape[2];
    const numClasses = numFeatures - 5;
    
    // Dynamically get input size instead of hardcoding 416
    const inputWidth = metadata.input_size[1] || 416;
    const inputHeight = metadata.input_size[0] || 416;
    
    // Dynamically compute grids based on actual input size
    const grids: {x: number, y: number, s: number}[] = [];
    const stridesList = [8, 16, 32];
    for (const s of stridesList) {
      const gridW = Math.floor(inputWidth / s);
      const gridH = Math.floor(inputHeight / s);
      for (let y = 0; y < gridH; y++) {
        for (let x = 0; x < gridW; x++) {
          grids.push({ x, y, s });
        }
      }
    }
    
    const boxes: BoundingBox[] = [];
    
    for (let a = 0; a < numAnchors; a++) {
      const offset = a * numFeatures;
      const objConf = rawData[offset + 4];
      
      if (objConf < threshold) continue;
      
      let maxClassConf = 0;
      let classId = -1;
      for (let c = 0; c < numClasses; c++) {
        const conf = rawData[offset + 5 + c];
        if (conf > maxClassConf) {
          maxClassConf = conf;
          classId = c;
        }
      }
      
      const score = objConf * maxClassConf;
      if (score > threshold) {
        const grid = grids[a];
        if (!grid) break;
        
        const rawCx = rawData[offset + 0];
        const rawCy = rawData[offset + 1];
        const rawW = rawData[offset + 2];
        const rawH = rawData[offset + 3];
        
        // Decode coordinates to input-space (e.g. 416x416)
        const decodedCx = (rawCx + grid.x) * grid.s;
        const decodedCy = (rawCy + grid.y) * grid.s;
        const decodedW = Math.exp(rawW) * grid.s;
        const decodedH = Math.exp(rawH) * grid.s;
        
        // Scale directly from input-space to canvas space
        const cx = decodedCx * scaleX;
        const cy = decodedCy * scaleY;
        const w = decodedW * scaleX;
        const h = decodedH * scaleY;
        
        boxes.push({ 
          cx, cy, w, h, 
          conf: score, 
          classId, 
          label: getLabelName(classId, metadata),
          keypoints: [],
          maskCoeffs: null
        });
      }
    }
    
    return { 
      type: 'detection', 
      boxes: applyNMS(boxes, iouThreshold, maxDetections), 
      numClasses, 
      count: boxes.length 
    };
  }
}
