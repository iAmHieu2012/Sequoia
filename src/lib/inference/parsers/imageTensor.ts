import { ParsedImageToImageResult } from '@/types/playground';
import { OutputParser, ParseOptions } from './types';

/**
 * Parser for models that return an image tensor (e.g. style transfer, depth estimation, super resolution).
 * Expected output tensor: [1, H, W, C] (NHWC) or [1, C, H, W] (NCHW).
 * C is usually 1 (grayscale) or 3 (RGB).
 */
export class ImageTensorParser implements OutputParser {
  parse({ rawData, shape, taskType }: ParseOptions): ParsedImageToImageResult {
    let height: number, width: number, channels: number;
    let isNCHW = false;

    // Detect format
    if (shape.length === 4) {
      if (shape[1] === 1 || shape[1] === 3) {
        isNCHW = true;
        channels = shape[1];
        height = shape[2];
        width = shape[3];
      } else {
        height = shape[1];
        width = shape[2];
        channels = shape[3];
      }
    } else if (shape.length === 3) {
      if (shape[0] === 1 || shape[0] === 3) {
         isNCHW = true;
         channels = shape[0];
         height = shape[1];
         width = shape[2];
      } else {
         height = shape[0];
         width = shape[1];
         channels = shape[2];
      }
    } else {
      throw new Error(`Unexpected image tensor shape: ${shape}`);
    }

    const imageData = new ImageData(width, height);
    const planeSize = height * width;

    let min = Infinity, max = -Infinity;
    if (taskType === 'depth-estimation' && channels === 1) {
      for (let i = 0; i < height * width; i++) {
        if (rawData[i] < min) min = rawData[i];
        if (rawData[i] > max) max = rawData[i];
      }
      if (max === min) max = min + 1e-5;
    }

    const isFloat = rawData[0] <= 1.0 && rawData[0] >= -1.0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const destIdx = (y * width + x) * 4;
        let r, g, b;

        if (isNCHW) {
          const pIdx = y * width + x;
          if (channels === 1) {
            const v = rawData[pIdx];
            r = g = b = v;
          } else {
            r = rawData[pIdx];
            g = rawData[planeSize + pIdx];
            b = rawData[planeSize * 2 + pIdx];
          }
        } else {
          const pIdx = (y * width + x) * channels;
          if (channels === 1) {
            const v = rawData[pIdx];
            r = g = b = v;
          } else {
            r = rawData[pIdx];
            g = rawData[pIdx + 1];
            b = rawData[pIdx + 2];
          }
        }

        if (taskType === 'depth-estimation' && channels === 1) {
          // Normalize depth to 0-255 grayscale
          const norm = (r - min) / (max - min);
          const v = Math.floor(Math.max(0, Math.min(1, norm)) * 255);
          imageData.data[destIdx] = v;
          imageData.data[destIdx + 1] = v;
          imageData.data[destIdx + 2] = v;
          imageData.data[destIdx + 3] = 255;
        } else {
          // Normal image to image (Style Transfer, ESRGAN)
          imageData.data[destIdx] = isFloat ? Math.floor(Math.max(0, Math.min(1, r)) * 255) : r;
          imageData.data[destIdx + 1] = isFloat ? Math.floor(Math.max(0, Math.min(1, g)) * 255) : g;
          imageData.data[destIdx + 2] = isFloat ? Math.floor(Math.max(0, Math.min(1, b)) * 255) : b;
          imageData.data[destIdx + 3] = 255;
        }
      }
    }

    return {
      type: 'image-to-image',
      imageData,
      width,
      height,
      count: 1
    };
  }
}
