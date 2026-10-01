import { ParsedResult, Keypoint } from '@/types/playground';
import { OutputParser, ParseOptions } from './types';
import { getLabelName } from './utils';

/**
 * Parser for RTMPose models using SimCC representation.
 * Expected outputs: SimCC X and SimCC Y vectors.
 */
export class RtmPoseParser implements OutputParser {
  parse({ rawData, metadata, scaleX, scaleY, protoData }: ParseOptions): ParsedResult {
    if (!protoData) {
      return { type: 'pose', keypoints: [], count: 0 };
    }

    const simccX = rawData;
    const simccY = protoData;
    
    // Read parameters from metadata with fallbacks
    const numKeypoints = metadata.post_processing?.num_keypoints ?? 21;
    const splitRatio = metadata.post_processing?.simcc_split_ratio ?? 2.0;

    const xBins = simccX.length / numKeypoints;
    const yBins = simccY.length / numKeypoints;

    const keypoints: Keypoint[] = [];
    
    for (let k = 0; k < numKeypoints; k++) {
      // SimCC X: find argmax in the 1D vector for keypoint k
      let maxValX = -Infinity;
      let argmaxX = 0;
      for (let i = 0; i < xBins; i++) {
        const val = simccX[k * xBins + i];
        if (val > maxValX) {
          maxValX = val;
          argmaxX = i;
        }
      }

      // SimCC Y: find argmax in the 1D vector for keypoint k
      let maxValY = -Infinity;
      let argmaxY = 0;
      for (let j = 0; j < yBins; j++) {
        const val = simccY[k * yBins + j];
        if (val > maxValY) {
          maxValY = val;
          argmaxY = j;
        }
      }

      // Convert from bin index to input image coordinates
      const kx = argmaxX / splitRatio;
      const ky = argmaxY / splitRatio;

      // Scale directly to canvas coordinates and inject label
      keypoints.push({
        x: kx * scaleX,
        y: ky * scaleY,
        conf: 1.0, // SimCC argmax does not directly yield a normalized confidence [0-1] without extra softmax
        id: k,
        label: getLabelName(k, metadata)
      });
    }

    return {
      type: 'pose',
      keypoints: keypoints,
      count: 1
    };
  }
}
