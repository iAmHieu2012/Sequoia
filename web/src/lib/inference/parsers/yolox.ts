import { BoundingBox, ModelMetadata, PlaygroundParams, ParsedResult, ParsedDetectionResult } from '@/types/playground';
import { OutputParser } from './types';

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
    const threshold = (params.threshold as number) ?? 0.25;
    const iouThreshold = (params.iou_threshold as number) ?? 0.45;
    const maxDetections = (params.max_detections as number) ?? 100;
    
    // YOLOX usually outputs [1, 3549, 85]
    const numAnchors = shape[1];
    const numFeatures = shape[2];
    const numClasses = numFeatures - 5;
    const SIZE = metadata.input_size[1] || 416; // width
    
    // Precompute grids and strides if not done (for 416, it's 3549 anchors)
    const grids: {x: number, y: number, s: number}[] = [];
    const stridesList = [8, 16, 32];
    for (const s of stridesList) {
      const n = Math.floor(SIZE / s);
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
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
        
        // Decode coordinates to 416-space
        const decodedCx = (rawCx + grid.x) * grid.s;
        const decodedCy = (rawCy + grid.y) * grid.s;
        const decodedW = Math.exp(rawW) * grid.s;
        const decodedH = Math.exp(rawH) * grid.s;
        
        // Normalize to 0-1, then scale using the same convention as YOLOv8 parser
        const cx = (decodedCx / SIZE) * SIZE * scaleX;
        const cy = (decodedCy / SIZE) * SIZE * scaleY;
        const w = (decodedW / SIZE) * SIZE * scaleX;
        const h = (decodedH / SIZE) * SIZE * scaleY;
        
        boxes.push({ 
          cx, cy, w, h, 
          conf: score, classId, 
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

// ============================================================
// NMS utilities (duplicated for isolation, or could be shared)
// ============================================================
function calculateIoU(b1: BoundingBox, b2: BoundingBox): number {
  const x1 = Math.max(b1.cx - b1.w / 2, b2.cx - b2.w / 2);
  const y1 = Math.max(b1.cy - b1.h / 2, b2.cy - b2.h / 2);
  const x2 = Math.min(b1.cx + b1.w / 2, b2.cx + b2.w / 2);
  const y2 = Math.min(b1.cy + b1.h / 2, b2.cy + b2.h / 2);
  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const area1 = b1.w * b1.h;
  const area2 = b2.w * b2.h;
  const union = area1 + area2 - intersection;
  return union > 0 ? intersection / union : 0;
}

function applyNMS(boxes: BoundingBox[], iouThreshold: number, maxDetections = 20): BoundingBox[] {
  boxes.sort((a, b) => b.conf - a.conf);
  const kept: BoundingBox[] = [];
  const active = [...boxes];
  
  while (active.length > 0 && kept.length < maxDetections) {
    const current = active.shift()!;
    kept.push(current);
    
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].classId === current.classId) {
        if (calculateIoU(current, active[i]) > iouThreshold) {
          active.splice(i, 1);
        }
      }
    }
  }
  return kept;
}
