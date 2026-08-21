import { TaskRenderer } from './types';
import { DetectionRenderer } from './detection';
import { PoseRenderer } from './pose';
import { SegmentationRenderer } from './segmentation';
import { ClassificationRenderer } from './classification';
import { FaceLandmarkRenderer } from './faceLandmark';
import { SemanticSegmentationRenderer } from './semanticSegmentation';
import { ImageToImageRenderer } from './imageToImage';
import { OcrRenderer } from './ocr';

export type { TaskRenderer };
export { 
  DetectionRenderer, 
  PoseRenderer, 
  SegmentationRenderer, 
  ClassificationRenderer, 
  FaceLandmarkRenderer, 
  SemanticSegmentationRenderer, 
  ImageToImageRenderer, 
  OcrRenderer 
};

const renderers: Record<string, () => TaskRenderer> = {
  'object-detection': () => new DetectionRenderer(),
  'face-detection': () => new DetectionRenderer(),
  'face-landmark-detection': () => new FaceLandmarkRenderer(),
  'pose-estimation': () => new PoseRenderer(),
  'hand-tracking': () => new PoseRenderer(),
  'instance-segmentation': () => new SegmentationRenderer(),
  'semantic-segmentation': () => new SemanticSegmentationRenderer(),
  'image-segmentation': () => new SemanticSegmentationRenderer(),
  'image-classification': () => new ClassificationRenderer(),
  'image-to-image': () => new ImageToImageRenderer(),
  'style-transfer': () => new ImageToImageRenderer(),
  'depth-estimation': () => new ImageToImageRenderer(),
  'super-resolution': () => new ImageToImageRenderer(),
  'ocr': () => new OcrRenderer(),
  'text-detection': () => new OcrRenderer(),
};

export function getRenderer(taskType: string): TaskRenderer {
  const factory = renderers[taskType];
  if (!factory) {
    throw new Error(`No renderer found for task_type: ${taskType}`);
  }
  return factory();
}
