import { BoundingBox, ParsedDetectionResult } from '@/types/playground';
import { OutputParser, ParseOptions } from './types';
import { applyNMS, getLabelName, getParsedInputSize } from './utils';

/**
 * Parser for YOLOX output format.
 * Output tensor layout: [batch, anchors, features]
 * Features = 4 (raw_cx, raw_cy, raw_w, raw_h) + 1 (obj_conf) + numClasses
 * Note: Boxes are NOT decoded. Must decode using strides 8, 16, 32.
 */
export class YoloxParser implements OutputParser {
  parse({ rawData, shape, params, metadata, scaleX, scaleY }: ParseOptions): ParsedDetectionResult {
    const threshold = (params.threshold as number) ?? metadata.post_processing?.default_threshold ?? 0.25;
    const iouThreshold = (params.iou_threshold as number) ?? metadata.post_processing?.default_iou ?? 0.45;
    const maxDetections = (params.max_detections as number) ?? metadata.post_processing?.default_max_detections ?? 100;
    
    // YOLOX usually outputs [1, N, 85] (4 box + 1 objectness + 80 COCO classes)
    const numAnchors = shape[1];
    const numFeatures = shape[2];
    const numClasses = numFeatures - 5;
    
    const { width: inputWidth, height: inputHeight } = getParsedInputSize(metadata, 416);
    
    // Anchor a maps to one grid cell; cells are listed stride by stride, row-major,
    // matching the order of the model's output.
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
        // More anchors than grid cells: metadata input size doesn't match the model.
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
    
    // Count only the boxes that survive NMS, i.e. what is actually drawn.
    const keptBoxes = applyNMS(boxes, iouThreshold, maxDetections);
    return {
      type: 'detection',
      boxes: keptBoxes,
      numClasses,
      count: keptBoxes.length
    };
  }
}
