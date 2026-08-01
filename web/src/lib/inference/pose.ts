import { BoundingBox } from './types';

export function renderPose(
  dCtx: CanvasRenderingContext2D,
  b: BoundingBox
) {
  const kps = b.keypoints;
  const skeleton = [
    [15, 13], [13, 11], [16, 14], [14, 12], [11, 12], 
    [5, 11], [6, 12], [5, 6], [5, 7], [6, 8], [7, 9], 
    [8, 10], [1, 2], [0, 1], [0, 2], [1, 3], [2, 4], 
    [3, 5], [4, 6]
  ];
  
  dCtx.strokeStyle = '#00F0FF';
  dCtx.lineWidth = 2;
  
  for (const [i, j] of skeleton) {
    if (kps[i] && kps[j] && kps[i].conf > 0.3 && kps[j].conf > 0.3) {
      dCtx.beginPath();
      dCtx.moveTo(kps[i].x, kps[i].y);
      dCtx.lineTo(kps[j].x, kps[j].y);
      dCtx.stroke();
    }
  }

  dCtx.fillStyle = '#FF3366';
  for (const kp of kps) {
    if (kp.conf > 0.3) {
      dCtx.beginPath();
      dCtx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
      dCtx.fill();
    }
  }
}
