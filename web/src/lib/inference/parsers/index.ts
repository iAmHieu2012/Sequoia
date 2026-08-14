export type { OutputParser } from './types';
export { YoloParser } from './yolo';
export { ClassificationParser } from './classification';
export { ImageTensorParser } from './imageTensor';
export { SegmentationMaskParser } from './segmentationMask';
export { SsdParser } from './ssd';
export { MoveNetParser } from './movenet';

import { OutputParser } from './types';
import { YoloParser } from './yolo';
import { ClassificationParser } from './classification';
import { ImageTensorParser } from './imageTensor';
import { SegmentationMaskParser } from './segmentationMask';
import { SsdParser } from './ssd';
import { MoveNetParser } from './movenet';

const parsers: Record<string, () => OutputParser> = {
  'yolo_v8': () => new YoloParser(),
  'classification': () => new ClassificationParser(),
  'image_tensor': () => new ImageTensorParser(),
  'segmentation_mask': () => new SegmentationMaskParser(),
  'ssd': () => new SsdParser(),
  'movenet': () => new MoveNetParser(),
};

export function getParser(outputFormat: string): OutputParser {
  const factory = parsers[outputFormat];
  if (!factory) {
    throw new Error(`No parser found for output_format: ${outputFormat}`);
  }
  return factory();
}
