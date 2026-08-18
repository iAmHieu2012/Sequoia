
import { TaskRenderer, RenderOptions } from './types';
import { RENDERER_THEME } from './theme';

/**
 * Renderer for instance segmentation results.
 * Draws individual object masks, bounding boxes, and labels.
 */
export class SegmentationRenderer implements TaskRenderer {
  private tempCanvas: HTMLCanvasElement | null = null;
  private tempCtx: CanvasRenderingContext2D | null = null;

  render({ ctx, result, params, canvasWidth, canvasHeight, protoData, protoShape }: RenderOptions): void {
    if (result.type !== 'detection') return;
    
    const showLabels = params.show_labels !== false;
    const showConf = params.show_confidence !== false;
    const maskOpacity = (params.mask_opacity as number) ?? 0.6;
    
    for (const b of result.boxes) {
      // Draw mask
      if (b.maskCoeffs && protoData && protoShape) {
        let maskH = 160, maskW = 160, maskChannels = 32;
        let isProtoNCHW = false;
        
        if (protoShape[1] === 32) {
          isProtoNCHW = true;
          maskChannels = protoShape[1];
          maskH = protoShape[2];
          maskW = protoShape[3];
        } else {
          maskH = protoShape[1] || 160;
          maskW = protoShape[2] || 160;
          maskChannels = protoShape[3] || 32;
        }
        
        if (!this.tempCanvas || this.tempCanvas.width !== maskW || this.tempCanvas.height !== maskH) {
          this.tempCanvas = document.createElement('canvas');
          this.tempCanvas.width = maskW;
          this.tempCanvas.height = maskH;
          this.tempCtx = this.tempCanvas.getContext('2d');
        }
        
        const maskCtx = this.tempCtx;
        if (maskCtx) {
          const imgData = maskCtx.createImageData(maskW, maskH);
          
          const maskScaleX = maskW / canvasWidth;
          const maskScaleY = maskH / canvasHeight;
          const left = Math.max(0, Math.floor((b.cx - b.w / 2) * maskScaleX));
          const right = Math.min(maskW, Math.ceil((b.cx + b.w / 2) * maskScaleX));
          const top = Math.max(0, Math.floor((b.cy - b.h / 2) * maskScaleY));
          const bottom = Math.min(maskH, Math.ceil((b.cy + b.h / 2) * maskScaleY));

          const colors = RENDERER_THEME.segmentationColorsRGB;
          const c = colors[b.classId % colors.length];

          for (let y = top; y < bottom; y++) {
            for (let x = left; x < right; x++) {
              let sum = 0;
              if (isProtoNCHW) {
                for (let m = 0; m < maskChannels; m++) {
                  sum += b.maskCoeffs[m] * protoData[m * (maskH * maskW) + (y * maskW + x)];
                }
              } else {
                const pIdx = (y * maskW + x) * maskChannels;
                for (let m = 0; m < maskChannels; m++) {
                  sum += b.maskCoeffs[m] * protoData[pIdx + m];
                }
              }
              
              if (1 / (1 + Math.exp(-sum)) > 0.5) {
                const idx = (y * maskW + x) * 4;
                imgData.data[idx] = c[0];
                imgData.data[idx+1] = c[1];
                imgData.data[idx+2] = c[2];
                imgData.data[idx+3] = Math.floor(255 * maskOpacity);
              }
            }
          }
          maskCtx.putImageData(imgData, 0, 0);
          ctx.drawImage(this.tempCanvas!, 0, 0, maskW, maskH, 0, 0, canvasWidth, canvasHeight);
        }
      }

      // Draw bounding box + labels
      if (showLabels || showConf) {
        const scale = Math.max(canvasWidth, canvasHeight) / 640;
        const fontSize = Math.floor(10 * scale);
        const boxHeight = Math.floor(18 * scale);
        const padding = Math.floor(4 * scale);

        const x = b.cx - b.w / 2;
        const y = b.cy - b.h / 2;
        
        ctx.strokeStyle = RENDERER_THEME.colors.coral;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, b.w, b.h);
        
        let text = '';
        if (showLabels) text += (b.label || `OBJ ${b.classId}`).toUpperCase();
        if (showLabels && showConf) text += ' ';
        if (showConf) text += `${(b.conf * 100).toFixed(0)}%`;
        
        ctx.font = `${fontSize}px monospace`;
        const textWidth = ctx.measureText(text).width;
        
        // Prevent label from drawing outside the top of the canvas
        const labelY = Math.max(boxHeight, y);

        ctx.fillStyle = RENDERER_THEME.colors.textBg;
        ctx.fillRect(x, labelY - boxHeight, textWidth + padding * 2, boxHeight);
        
        ctx.fillStyle = RENDERER_THEME.colors.coral;
        ctx.fillText(text, x + padding, labelY - padding);
      }
    }
  }
}
