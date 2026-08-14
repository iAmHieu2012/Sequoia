import { BoundingBox, ModelMetadata, PlaygroundParams, ParsedDetectionResult } from '@/types/playground';
import { OutputParser } from './types';

export class SsdParser implements OutputParser {
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
    const width = metadata.input_size[1] || 640;
    const height = metadata.input_size[0] || 640;

    if (!protoData || !protoShape) {
      throw new Error('SSD Parser requires two output tensors (boxes and scores)');
    }

    let boxesData: Float32Array;
    let scoresData: Float32Array;
    let numBoxes: number;
    let numClasses: number;

    // Determine which tensor is boxes (has 4 features) and which is scores
    if (shape[2] === 4) {
      boxesData = rawData;
      scoresData = protoData;
      numBoxes = shape[1];
      numClasses = protoShape[2];
    } else if (protoShape[2] === 4) {
      boxesData = protoData;
      scoresData = rawData;
      numBoxes = protoShape[1];
      numClasses = shape[2];
    } else {
      throw new Error('Could not identify bounding box tensor (expected last dimension = 4)');
    }

    const boxes: BoundingBox[] = [];

    for (let i = 0; i < numBoxes; i++) {
      let maxConf = 0;
      let classId = -1;

      // Find max class confidence for this box
      for (let c = 0; c < numClasses; c++) {
        const conf = scoresData[i * numClasses + c];
        if (conf > maxConf) {
          maxConf = conf;
          classId = c;
        }
      }

      if (maxConf > threshold) {
        // SSD typically outputs [ymin, xmin, ymax, xmax] in normalized coordinates
        let ymin = boxesData[i * 4];
        let xmin = boxesData[i * 4 + 1];
        let ymax = boxesData[i * 4 + 2];
        let xmax = boxesData[i * 4 + 3];

        // Convert to cx, cy, w, h
        let cx = (xmin + xmax) / 2;
        let cy = (ymin + ymax) / 2;
        let boxW = (xmax - xmin);
        let boxH = (ymax - ymin);

        // De-normalize and scale to canvas
        cx = cx * width * scaleX;
        cy = cy * height * scaleY;
        boxW = boxW * width * scaleX;
        boxH = boxH * height * scaleY;

        boxes.push({
          cx, cy, w: boxW, h: boxH,
          conf: maxConf,
          classId,
          keypoints: [],
          maskCoeffs: null
        });
      }
    }

    // Usually SSD models have internal NMS, but we can apply it just in case
    // For simplicity, we just return the boxes filtered by threshold
    // You could import applyNMS here if needed.
    
    // Sort by confidence
    boxes.sort((a, b) => b.conf - a.conf);
    
    const maxDetections = (params.max_detections as number) ?? 20;
    const kept = boxes.slice(0, maxDetections);

    return {
      type: 'detection',
      boxes: kept,
      numClasses,
      count: kept.length
    };
  }
}
