import { BoundingBox } from './types';

/**
 * Parses raw YOLO output tensor into bounding boxes with NMS applied.
 * 
 * Supports detection, pose estimation, and instance segmentation.
 * Automatically detects transposed tensor layout (NHWC vs NCHW-style flattening)
 * and normalized vs absolute coordinates.
 * 
 * For segmentation, numClasses is computed dynamically:
 *   numFeatures - 4 (bbox) - 32 (mask coefficients)
 */
export function parseYoloBoxes(
  outData: Float32Array,
  outShape: number[],
  taskType: string,
  threshold: number,
  iouThreshold: number,
  width: number,
  height: number,
  scaleX: number,
  scaleY: number
): { boxes: BoundingBox[], numClasses: number } {
  let numFeatures: number, numAnchors: number;
  let isTransposed = false;
  
  if (outShape[1] > outShape[2]) {
    numAnchors = outShape[1];
    numFeatures = outShape[2];
    isTransposed = true;
  } else {
    numFeatures = outShape[1];
    numAnchors = outShape[2];
  }
  
  let numClasses: number;
  let hasKeypoints = false;
  let hasMasks = false;
  const MASK_COEFFICIENTS = 32;
  
  if (taskType === 'pose-estimation') {
    numClasses = 1;
    hasKeypoints = true;
  } else if (taskType === 'instance-segmentation') {
    // numFeatures = 4 (bbox) + numClasses + 32 (mask coefficients)
    numClasses = numFeatures - 4 - MASK_COEFFICIENTS;
    hasMasks = true;
  } else {
    // detection: numFeatures = 4 (bbox) + numClasses
    numClasses = numFeatures - 4;
  }

  const getValue = (f: number, a: number) => 
    isTransposed ? outData[a * numFeatures + f] : outData[f * numAnchors + a];
  
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
        for (let k = 0; k < 17; k++) {
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

  // Non-Maximum Suppression (NMS) — per-class IoU filtering
  return { boxes: applyNMS(boxes, iouThreshold), numClasses };
}

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
