export interface Keypoint {
  x: number;
  y: number;
  conf: number;
}

export interface BoundingBox {
  cx: number;
  cy: number;
  w: number;
  h: number;
  conf: number;
  classId: number;
  keypoints: Keypoint[];
  maskCoeffs: Float32Array | null;
}


