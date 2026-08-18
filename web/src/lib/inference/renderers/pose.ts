import { Keypoint } from '@/types/playground';
import { TaskRenderer, RenderOptions } from './types';
import { RENDERER_THEME } from './theme';

/**
 * Renderer for pose estimation and hand tracking results.
 * Draws keypoints and connects them with a skeleton based on model metadata.
 */
export class PoseRenderer implements TaskRenderer {
  render({ ctx, result, params, metadata }: RenderOptions): void {
    if (result.type !== 'detection' && result.type !== 'pose') return;
    
    const kpThreshold = (params.keypoint_threshold as number) ?? 0.5;
    const skeleton = metadata.visualization?.skeleton || [];
    
    ctx.strokeStyle = RENDERER_THEME.colors.teal;
    ctx.lineWidth = 2;
    
    const allKeypoints: Keypoint[][] = [];
    if (result.type === 'detection') {
      for (const b of result.boxes) {
        allKeypoints.push(b.keypoints);
      }
    } else if (result.type === 'pose') {
      allKeypoints.push(result.keypoints);
    }
    
    for (const kps of allKeypoints) {
      for (const [i, j] of skeleton) {
        if (kps[i] && kps[j] && kps[i].conf > kpThreshold && kps[j].conf > kpThreshold) {
          ctx.beginPath();
          ctx.moveTo(kps[i].x, kps[i].y);
          ctx.lineTo(kps[j].x, kps[j].y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = RENDERER_THEME.colors.coral;
      for (const kp of kps) {
        if (kp.conf > kpThreshold) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
  }
}
