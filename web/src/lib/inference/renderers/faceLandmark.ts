import { ModelMetadata, PlaygroundParams, ParsedResult } from '@/types/playground';
import { TaskRenderer } from './types';

export class FaceLandmarkRenderer implements TaskRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    result: ParsedResult,
    params: PlaygroundParams,
    metadata: ModelMetadata,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    if (result.type !== 'detection') return;
    
    const kpThreshold = (params.keypoint_threshold as number) ?? 0.3;
    const showBbox = params.show_labels !== false;
    
    for (const b of result.boxes) {
      if (showBbox) {
        ctx.strokeStyle = 'rgba(73, 174, 174, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.cx - b.w / 2, b.cy - b.h / 2, b.w, b.h);
      }

      const kps = b.keypoints;
      ctx.fillStyle = '#00FF99';
      for (const kp of kps) {
        if (kp.conf > kpThreshold) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
  }
}
