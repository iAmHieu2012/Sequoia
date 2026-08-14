import { BoundingBox, ModelMetadata, PlaygroundParams, ParsedResult, ParsedDetectionResult } from '@/types/playground';
import { OutputParser } from './types';

/**
 * Parser for YOLO v8 output format.
 * Output tensor layout: [batch, features, anchors] or [batch, anchors, features]
 * Features = 4 (cx, cy, w, h) + numClasses + optional (keypoints * 3 | mask_coefficients)
 */
export class YoloParser implements OutputParser {
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
    const threshold = (params.threshold as number) ?? 0.5;
    const iouThreshold = (params.iou_threshold as number) ?? 0.45;
    const width = metadata.input_size[1] || 640;
    const height = metadata.input_size[0] || 640;

    let numFeatures: number, numAnchors: number;
    let isTransposed = false;
    
    if (shape[1] > shape[2]) {
      numAnchors = shape[1];
      numFeatures = shape[2];
      isTransposed = true;
    } else {
      numFeatures = shape[1];
      numAnchors = shape[2];
    }
    
    let numClasses: number;
    let hasKeypoints = false;
    let hasMasks = false;
    const MASK_COEFFICIENTS = metadata.post_processing.num_mask_coefficients ?? 32;
    const NUM_KEYPOINTS = metadata.post_processing.num_keypoints ?? 17;
    
    if (taskType === 'pose-estimation') {
      numClasses = 1;
      hasKeypoints = true;
    } else if (taskType === 'instance-segmentation') {
      numClasses = numFeatures - 4 - MASK_COEFFICIENTS;
      hasMasks = true;
    } else {
      numClasses = numFeatures - 4;
    }

    const getValue = (f: number, a: number) => 
      isTransposed ? rawData[a * numFeatures + f] : rawData[f * numAnchors + a];
    
    const boxes: BoundingBox[] = [];

    for (let a = 0; a < numAnchors; a++) {
      let maxClassConf = 0;
      let classId = -1;
      for (let c = 0; c < numClasses; c++) {
        const conf = getValue(4 + c, a);
        if (conf > maxClassConf) { maxClassConf = conf; classId = c; }
      }

      if (maxClassConf > threshold) {
        let cx = getValue(0, a);
        let cy = getValue(1, a);
        let boxW = getValue(2, a);
        let boxH = getValue(3, a);
        
        const isNormalized = (cx > 0 && cx < 2.0 && boxW < 2.0 && boxW > 0);
        if (isNormalized) {
           cx *= width; cy *= height; boxW *= width; boxH *= height;
        }

        cx *= scaleX;
        cy *= scaleY;
        boxW *= scaleX;
        boxH *= scaleY;
        
        const box: BoundingBox = { 
          cx, cy, w: boxW, h: boxH, 
          conf: maxClassConf, classId, 
          keypoints: [],
          maskCoeffs: null
        };
        
        if (hasKeypoints) {
          const kpStart = 4 + numClasses;
          for (let k = 0; k < NUM_KEYPOINTS; k++) {
            let kx = getValue(kpStart + k * 3, a);
            let ky = getValue(kpStart + k * 3 + 1, a);
            let kconf = getValue(kpStart + k * 3 + 2, a);
            
            if (isNormalized) {
              kx *= width;
              ky *= height;
            }
            
            kx *= scaleX;
            ky *= scaleY;
            
            if (kconf < 0 || kconf > 1) kconf = 1 / (1 + Math.exp(-kconf));
            
            box.keypoints.push({x: kx, y: ky, conf: kconf});
          }
        }
        
        if (hasMasks) {
          const coeffStart = 4 + numClasses;
          const coeffs = new Float32Array(MASK_COEFFICIENTS);
          for (let c = 0; c < MASK_COEFFICIENTS; c++) {
            coeffs[c] = getValue(coeffStart + c, a);
          }
          box.maskCoeffs = coeffs;
        }
        
        boxes.push(box);
      }
    }

    const maxDetections = (params.max_detections as number) ?? 20;
    return { 
      type: 'detection', 
      boxes: applyNMS(boxes, iouThreshold, maxDetections), 
      numClasses, 
      count: boxes.length 
    };
  }
}

// ============================================================
// NMS utilities (shared)
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
