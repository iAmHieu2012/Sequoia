import { ParsedSemanticSegmentationResult } from '@/types/playground';
import { OutputParser, ParseOptions } from './types';
import { SEGMENTATION_COLORS_RGB } from './utils';

/**
 * Parser for semantic segmentation models.
 * Expected output: [1, H, W, C] (logits/probs per class) or [1, H, W] (class IDs).
 */
export class SegmentationMaskParser implements OutputParser {
  parse({ rawData, shape, params, metadata }: ParseOptions): ParsedSemanticSegmentationResult {
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
    
    // Resolve dynamic opacity from params or metadata
    const rawOpacity = (params.mask_opacity as number) ?? metadata.post_processing?.default_mask_opacity ?? 0.6;
    const opacityValue = Math.floor(rawOpacity * 255);

    let min = Infinity, max = -Infinity;
    if (!isArgmaxed && channels === 1) {
      for (let i = 0; i < height * width; i++) {
        if (rawData[i] < min) min = rawData[i];
        if (rawData[i] > max) max = rawData[i];
      }
      if (max === min) max = min + 1e-5;
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let classId = 0;
        const destIdx = (y * width + x) * 4;

        if (isArgmaxed || (channels === 1 && metadata.classes_count > 1)) {
          classId = Math.round(rawData[y * width + x]);
        } else if (channels === 1 && metadata.visualization?.type === 'background_removal') {
          // Single channel & background removal mode: treat as alpha matte
          const val = (rawData[y * width + x] - min) / (max - min);
          maskData[destIdx] = 0;
          maskData[destIdx + 1] = 0;
          maskData[destIdx + 2] = 0;
          maskData[destIdx + 3] = val * 255;
          continue;
        } else if (channels === 1) {
          // Single channel & mask overlay mode (e.g. selfie binary mask)
          const val = (rawData[y * width + x] - min) / (max - min);
          const rgb = SEGMENTATION_COLORS_RGB[1]; // Cyan for class 1
          maskData[destIdx] = rgb[0];
          maskData[destIdx + 1] = rgb[1];
          maskData[destIdx + 2] = rgb[2];
          maskData[destIdx + 3] = val > 0.1 ? opacityValue : 0; // Hard threshold at 0.1
          continue;
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

        const rgb = SEGMENTATION_COLORS_RGB[classId % SEGMENTATION_COLORS_RGB.length];
        
        maskData[destIdx] = rgb[0];
        maskData[destIdx + 1] = rgb[1];
        maskData[destIdx + 2] = rgb[2];
        maskData[destIdx + 3] = classId === 0 ? 0 : opacityValue;
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
