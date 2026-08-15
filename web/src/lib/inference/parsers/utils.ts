import { BoundingBox, ModelMetadata } from '@/types/playground';

/**
 * Common RGB colors for semantic segmentation masks.
 * Format: [R, G, B]. Alpha channel will be applied dynamically by the parser.
 */
export const SEGMENTATION_COLORS_RGB = [
  [0, 0, 0],       // Background (class 0)
  [73, 174, 174],  // Class 1 (System Teal)
  [255, 80, 80],   // Class 2 (Coral Red)
  [0, 255, 153],   // Class 3 (Turquoise)
  [255, 153, 0],   // Class 4 (Orange)
  [153, 0, 255]    // Class 5 (Purple)
];

/**
 * Helper to resolve class label safely from metadata
 */
export function getLabelName(classId: number, metadata: ModelMetadata): string {
  if (metadata.labels && metadata.labels.length > classId) {
    return metadata.labels[classId];
  }
  return `CLASS ${classId}`;
}

/**
 * Helper to calculate Intersection over Union (IoU) between two bounding boxes.
 */
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
 * Preserves the highest confidence box and removes others that overlap above the iouThreshold.
 */
export function applyNMS(boxes: BoundingBox[], iouThreshold: number, maxDetections = 20): BoundingBox[] {
  // Sort boxes by confidence in descending order
  boxes.sort((a, b) => b.conf - a.conf);
  
  const kept: BoundingBox[] = [];
  const active = [...boxes];
  
  while (active.length > 0 && kept.length < maxDetections) {
    const current = active.shift()!;
    kept.push(current);
    
    for (let i = active.length - 1; i >= 0; i--) {
      // Only suppress boxes of the same class
      if (active[i].classId === current.classId) {
        if (calculateIoU(current, active[i]) > iouThreshold) {
          active.splice(i, 1);
        }
      }
    }
  }
  
  return kept;
}
