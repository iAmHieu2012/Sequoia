import { OutputParser } from './types';
import { YoloParser } from './yolo';
import { YoloxParser } from './yolox';
import { ClassificationParser } from './classification';
import { ImageTensorParser } from './imageTensor';
import { SegmentationMaskParser } from './segmentationMask';
import { SsdParser } from './ssd';
import { MoveNetParser } from './movenet';
import { RtmPoseParser } from './rtmpose';

export type { OutputParser };
export { 
  YoloParser, 
  YoloxParser, 
  ClassificationParser, 
  ImageTensorParser, 
  SegmentationMaskParser, 
  SsdParser, 
  MoveNetParser,
  RtmPoseParser
};

const parsers: Record<string, () => OutputParser> = {
  'yolo_v8': () => new YoloParser(),
  'yolox': () => new YoloxParser(),
  'classification': () => new ClassificationParser(),
  'image_tensor': () => new ImageTensorParser(),
  'segmentation_mask': () => new SegmentationMaskParser(),
  'ssd': () => new SsdParser(),
  'movenet': () => new MoveNetParser(),
  'rtmpose_simcc': () => new RtmPoseParser(),
};

export function getParser(outputFormat: string): OutputParser {
  const factory = parsers[outputFormat];
  if (!factory) {
    throw new Error(`No parser found for output_format: ${outputFormat}`);
  }
  return factory();
}
