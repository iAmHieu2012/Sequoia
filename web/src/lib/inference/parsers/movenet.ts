import { BoundingBox, ModelMetadata, PlaygroundParams, ParsedDetectionResult } from '@/types/playground';
import { OutputParser } from './types';
import { getLabelName } from './utils';

/**
 * Parser for MoveNet pose estimation models.
 * Expected output tensor: [1, 1, 17, 3] containing [y, x, conf] per keypoint.
 */
export class MoveNetParser implements OutputParser {
  parse(
    rawData: Float32Array,
    shape: number[],
    taskType: string,
    params: PlaygroundParams,
    metadata: ModelMetadata,
    scaleX: number,
    scaleY: number
  ): ParsedDetectionResult {
    // Dynamically fallback to 256 if not specified
    const width = metadata.input_size[1] ?? 256;
    const height = metadata.input_size[0] ?? 256;

    // MoveNet typically outputs [1, 1, 17, 3]
    if (shape.length !== 4 || shape[3] !== 3) {
      throw new Error(`Unexpected MoveNet tensor shape: ${shape}`);
    }

    const numKeypoints = shape[2];
    const keypoints = [];
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    let validKeypoints = 0;

    // Default keypoint threshold (optional parameter mapping)
    const kpThreshold = (params.keypoint_threshold as number) ?? metadata.post_processing?.default_keypoint_threshold ?? 0.2;

    for (let i = 0; i < numKeypoints; i++) {
      // Data is [y, x, conf] in normalized coordinates [0-1]
      let ky = rawData[i * 3];
      let kx = rawData[i * 3 + 1];
      let conf = rawData[i * 3 + 2];

      // De-normalize and scale to canvas
      kx = kx * width * scaleX;
      ky = ky * height * scaleY;

      keypoints.push({ 
        x: kx, 
        y: ky, 
        conf,
        id: i,
        label: getLabelName(i, metadata)
      });

      if (conf > kpThreshold) {
        if (kx < minX) minX = kx;
        if (kx > maxX) maxX = kx;
        if (ky < minY) minY = ky;
        if (ky > maxY) maxY = ky;
        validKeypoints++;
      }
    }

    // MoveNet only predicts keypoints, it doesn't give a bounding box natively.
    // We can infer a bounding box from the keypoints for the renderer if needed.
    let cx = 0, cy = 0, boxW = 0, boxH = 0;
    if (validKeypoints > 0) {
      cx = (minX + maxX) / 2;
      cy = (minY + maxY) / 2;
      boxW = (maxX - minX) * 1.2; // Add 20% padding
      boxH = (maxY - minY) * 1.2;
    }

    const box: BoundingBox = {
      cx, cy, w: boxW, h: boxH,
      conf: 1.0, // MoveNet doesn't have an overall box confidence
      classId: 0,
      label: getLabelName(0, metadata),
      keypoints,
      maskCoeffs: null
    };

    return {
      type: 'detection',
      boxes: validKeypoints > 0 ? [box] : [],
      numClasses: 1,
      count: validKeypoints > 0 ? 1 : 0
    };
  }
}
