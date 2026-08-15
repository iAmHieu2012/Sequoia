import { ModelMetadata, PlaygroundParams, ParsedResult, Keypoint } from '@/types/playground';
import { OutputParser } from './types';

export class RtmPoseParser implements OutputParser {
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
  ): ParsedResult {
    if (!protoData) {
      return { type: 'pose', keypoints: [], count: 0 };
    }

    const simccX = rawData;
    const simccY = protoData;
    
    const numKeypoints = metadata.post_processing?.num_keypoints || 21;
    const splitRatio = metadata.post_processing?.simcc_split_ratio || 2.0;

    const xBins = simccX.length / numKeypoints;
    const yBins = simccY.length / numKeypoints;

    const keypoints: Keypoint[] = [];
    
    for (let k = 0; k < numKeypoints; k++) {
      // SimCC X
      let maxValX = -Infinity;
      let argmaxX = 0;
      for (let i = 0; i < xBins; i++) {
        // [1, 21, 512] -> index = k * 512 + i
        const val = simccX[k * xBins + i];
        if (val > maxValX) {
          maxValX = val;
          argmaxX = i;
        }
      }

      // SimCC Y
      let maxValY = -Infinity;
      let argmaxY = 0;
      for (let j = 0; j < yBins; j++) {
        const val = simccY[k * yBins + j];
        if (val > maxValY) {
          maxValY = val;
          argmaxY = j;
        }
      }

      // Convert from bin index to normalized model coordinates (0-256)
      const kx = argmaxX / splitRatio;
      const ky = argmaxY / splitRatio;

      // Scale to canvas coordinates
      keypoints.push({
        x: kx * scaleX,
        y: ky * scaleY,
        conf: 1.0, 
        id: k
      });
    }

    return {
      type: 'pose',
      keypoints: keypoints,
      count: 1
    };
  }
}
