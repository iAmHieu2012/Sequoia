import { BoundingBox, ModelMetadata, PlaygroundParams, ParsedDetectionResult } from '@/types/playground';
import { OutputParser } from './types';
import { applyNMS, getLabelName } from './utils';

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
    const threshold = (params.threshold as number) ?? metadata.post_processing.default_threshold ?? 0.5;
    const iouThreshold = (params.iou_threshold as number) ?? metadata.post_processing.default_iou ?? 0.45;
    const maxDetections = (params.max_detections as number) ?? metadata.post_processing.default_max_detections ?? 20;
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
          conf: maxClassConf, 
          classId, 
          label: getLabelName(classId, metadata),
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
            
            box.keypoints.push({x: kx, y: ky, conf: kconf, label: getLabelName(k, metadata)});
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

    return { 
      type: 'detection', 
      boxes: applyNMS(boxes, iouThreshold, maxDetections), 
      numClasses, 
      count: boxes.length 
    };
  }
}
