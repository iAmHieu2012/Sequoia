import { BoundingBox, ModelMetadata } from '@/types/playground';

/** Label for a class id from metadata, or "CLASS <id>" when there is none. */
export function getLabelName(classId: number, metadata: ModelMetadata): string {
  if (metadata.labels && metadata.labels.length > classId) {
    return metadata.labels[classId];
  }
  return `CLASS ${classId}`;
}

/** Intersection over Union (IoU) of two center-format boxes. */
export function calculateIoU(b1: BoundingBox, b2: BoundingBox): number {
  const x1 = Math.max(b1.cx - b1.w / 2, b2.cx - b2.w / 2);
  const y1 = Math.max(b1.cy - b1.h / 2, b2.cy - b2.h / 2);
  const x2 = Math.min(b1.cx + b1.w / 2, b2.cx + b2.w / 2);
  const y2 = Math.min(b1.cy + b1.h / 2, b2.cy + b2.h / 2);
  
  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const area1 = b1.w * b1.h;
  const area2 = b2.w * b2.h;
  
  const union = area1 + area2 - intersection;
  return union > 0 ? intersection / union : 0;
}

/**
 * Standard Non-Maximum Suppression (NMS) for filtering overlapping bounding boxes.
 * Keeps the highest-confidence box and drops same-class boxes that overlap it above iouThreshold.
 * Note: sorts `boxes` in place.
 */
export function applyNMS(boxes: BoundingBox[], iouThreshold: number, maxDetections = 20): BoundingBox[] {
  boxes.sort((a, b) => b.conf - a.conf);
  
  const kept: BoundingBox[] = [];
  const active = [...boxes];
  
  while (active.length > 0 && kept.length < maxDetections) {
    const current = active.shift()!;
    kept.push(current);
    
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].classId === current.classId) {
        if (calculateIoU(current, active[i]) > iouThreshold) {
          active.splice(i, 1);
        }
      }
    }
  }
  
  return kept;
}

/**
 * Input width and height from ModelMetadata.input_size, or the defaults when it is missing.
 * Handles [H, W] and 4D shapes [1, H, W, 3] / [1, 3, H, W] (by input_layout).
 */
export function getParsedInputSize(
  metadata: ModelMetadata, 
  defaultWidth = 640,
  defaultHeight?: number
): { width: number, height: number } {
  let width = defaultWidth;
  let height = defaultHeight ?? defaultWidth;
  
  if (metadata.input_size) {
    if (metadata.input_size.length === 2) {
      height = metadata.input_size[0];
      width = metadata.input_size[1];
    } else if (metadata.input_size.length === 4) {
      if (metadata.input_layout === 'nchw') {
        height = metadata.input_size[2];
        width = metadata.input_size[3];
      } else {
        height = metadata.input_size[1];
        width = metadata.input_size[2];
      }
    }
  }
  return { width, height };
}
