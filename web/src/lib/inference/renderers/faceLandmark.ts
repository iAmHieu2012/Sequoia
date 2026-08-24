
import { TaskRenderer, RenderOptions } from './types';
import { RENDERER_THEME } from './theme';

/**
 * Renderer for face landmark detection results.
 * Draws bounding boxes and facial keypoints.
 */
export class FaceLandmarkRenderer implements TaskRenderer {
  render({ ctx, result, params }: RenderOptions): void {
    if (result.type !== 'detection') return;
    
    const kpThreshold = (params.keypoint_threshold as number) ?? 0.3;
    const showBbox = params.show_labels !== false;
    
    for (const b of result.boxes) {
      if (showBbox) {
        ctx.strokeStyle = RENDERER_THEME.colors.tealTranslucent;
        ctx.lineWidth = 1;
        ctx.strokeRect(b.cx - b.w / 2, b.cy - b.h / 2, b.w, b.h);
      }

      const kps = b.keypoints;
      ctx.fillStyle = RENDERER_THEME.colors.coral;
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
