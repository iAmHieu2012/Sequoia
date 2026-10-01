import { BoundingBox, ParsedDetectionResult } from '@/types/playground';
import { OutputParser, ParseOptions } from './types';
import { applyNMS, getLabelName, getParsedInputSize } from './utils';

/**
 * Parser for SSD (Single Shot MultiBox Detector) models.
 * Expected outputs: 2 tensors (bounding boxes and class scores).
 */
export class SsdParser implements OutputParser {
  parse({ rawData, shape, params, metadata, scaleX, scaleY, protoData, protoShape }: ParseOptions): ParsedDetectionResult {
    const threshold = (params.threshold as number) ?? metadata.post_processing?.default_threshold ?? 0.5;
    const iouThreshold = (params.iou_threshold as number) ?? metadata.post_processing?.default_iou ?? 0.45;
    const maxDetections = (params.max_detections as number) ?? metadata.post_processing?.default_max_detections ?? 20;
    
    const { width, height } = getParsedInputSize(metadata, 640);

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
        // SSD typically outputs [ymin, xmin, ymax, xmax] in normalized coordinates [0..1]
        const ymin = boxesData[i * 4];
        const xmin = boxesData[i * 4 + 1];
        const ymax = boxesData[i * 4 + 2];
        const xmax = boxesData[i * 4 + 3];

        // Convert to cx, cy, w, h
        let cx = (xmin + xmax) / 2;
        let cy = (ymin + ymax) / 2;
        let boxW = (xmax - xmin);
        let boxH = (ymax - ymin);

        // De-normalize and scale directly to canvas size
        cx = cx * width * scaleX;
        cy = cy * height * scaleY;
        boxW = boxW * width * scaleX;
        boxH = boxH * height * scaleY;

        boxes.push({
          cx, cy, w: boxW, h: boxH,
          conf: maxConf,
          classId,
          label: getLabelName(classId, metadata),
          keypoints: [],
          maskCoeffs: null
        });
      }
    }

    // Apply strict NMS (SSD raw outputs often need it, even if some have internal NMS ops)
    const keptBoxes = applyNMS(boxes, iouThreshold, maxDetections);

    return {
      type: 'detection',
      boxes: keptBoxes,
      numClasses,
      count: keptBoxes.length
    };
  }
}
