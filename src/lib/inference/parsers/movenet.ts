import { BoundingBox, ParsedDetectionResult } from '@/types/playground';
import { OutputParser, ParseOptions } from './types';
import { getLabelName, getParsedInputSize } from './utils';

/**
 * Parser for MoveNet pose estimation models.
 * Expected output tensor: [1, 1, 17, 3] containing [y, x, conf] per keypoint.
 */
export class MoveNetParser implements OutputParser {
  parse({ rawData, shape, params, metadata, scaleX, scaleY }: ParseOptions): ParsedDetectionResult {
    // Falls back to 256x256 when metadata has no input size.
    const { width, height } = getParsedInputSize(metadata, 256);

    if (shape.length !== 4 || shape[3] !== 3) {
      throw new Error(`Unexpected MoveNet tensor shape: ${shape}`);
    }

    const numKeypoints = shape[2];
    const keypoints = [];
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    let validKeypoints = 0;

    // Only keypoints above this confidence count toward the inferred bounding box below.
    const kpThreshold = (params.keypoint_threshold as number) ?? metadata.post_processing?.default_keypoint_threshold ?? 0.2;

    for (let i = 0; i < numKeypoints; i++) {
      // Data is [y, x, conf] in normalized coordinates [0-1]
      let ky = rawData[i * 3];
      let kx = rawData[i * 3 + 1];
      const conf = rawData[i * 3 + 2];

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

    // MoveNet only predicts keypoints, so derive a box around the confident ones
    // to fit the shared detection result shape.
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
