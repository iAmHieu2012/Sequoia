import { ModelMetadata, PlaygroundParams, ParsedSemanticSegmentationResult } from '@/types/playground';
import { OutputParser } from './types';

/**
 * Parser for semantic segmentation models.
 * Expected output: [1, H, W, C] (logits/probs per class) or [1, H, W] (class IDs).
 */
export class SegmentationMaskParser implements OutputParser {
  parse(
    rawData: Float32Array,
    shape: number[],
    taskType: string,
    params: PlaygroundParams,
    metadata: ModelMetadata,
    scaleX: number,
    scaleY: number
  ): ParsedSemanticSegmentationResult {
    let height: number, width: number, channels: number;
    let isArgmaxed = false;

    if (shape.length === 3) {
      // [1, H, W] - already argmaxed
      height = shape[1];
      width = shape[2];
      channels = 1;
      isArgmaxed = true;
    } else if (shape.length === 4) {
      if (shape[1] > shape[3]) {
        // NHWC: [1, H, W, C]
        height = shape[1];
        width = shape[2];
        channels = shape[3];
      } else {
        // NCHW: [1, C, H, W]
        channels = shape[1];
        height = shape[2];
        width = shape[3];
      }
    } else {
      throw new Error(`Unexpected segmentation mask shape: ${shape}`);
    }

    const maskData = new Uint8ClampedArray(width * height * 4);
    const maskOpacity = (params.mask_opacity as number) ?? 0.6;
    const opacityValue = Math.floor(maskOpacity * 255);

    const colors = [
      [0, 0, 0, 0], // Background (class 0)
      [73, 174, 174, opacityValue],
      [255, 80, 80, opacityValue],
      [0, 255, 153, opacityValue],
      [255, 153, 0, opacityValue],
      [153, 0, 255, opacityValue]
    ];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let classId = 0;

        if (isArgmaxed) {
          classId = rawData[y * width + x];
        } else {
          // Find argmax across channels
          let maxVal = -Infinity;
          
          for (let c = 0; c < channels; c++) {
            const val = shape[1] === channels 
              ? rawData[c * (height * width) + y * width + x] // NCHW
              : rawData[(y * width + x) * channels + c];      // NHWC
              
            if (val > maxVal) {
              maxVal = val;
              classId = c;
            }
          }
        }

        const destIdx = (y * width + x) * 4;
        const color = colors[classId % colors.length];
        
        maskData[destIdx] = color[0];
        maskData[destIdx + 1] = color[1];
        maskData[destIdx + 2] = color[2];
        maskData[destIdx + 3] = classId === 0 ? 0 : color[3];
      }
    }

    return {
      type: 'semantic-segmentation',
      maskData,
      width,
      height,
      count: 1
    };
  }
}
