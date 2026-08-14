import { ModelMetadata, PlaygroundParams, ParsedResult } from '@/types/playground';
import { TaskRenderer } from './types';

let cachedMaskCanvas: HTMLCanvasElement | null = null;
let cachedMaskCtx: CanvasRenderingContext2D | null = null;

export class SegmentationRenderer implements TaskRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    result: ParsedResult,
    params: PlaygroundParams,
    metadata: ModelMetadata,
    canvasWidth: number,
    canvasHeight: number,
    protoData?: Float32Array | null,
    protoShape?: number[]
  ): void {
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
        
        if (!cachedMaskCanvas || cachedMaskCanvas.width !== maskW || cachedMaskCanvas.height !== maskH) {
          cachedMaskCanvas = document.createElement('canvas');
          cachedMaskCanvas.width = maskW;
          cachedMaskCanvas.height = maskH;
          cachedMaskCtx = cachedMaskCanvas.getContext('2d');
        }
        
        const maskCtx = cachedMaskCtx;
        if (maskCtx) {
          const imgData = maskCtx.createImageData(maskW, maskH);
          
          const maskScaleX = maskW / canvasWidth;
          const maskScaleY = maskH / canvasHeight;
          const left = Math.max(0, Math.floor((b.cx - b.w / 2) * maskScaleX));
          const right = Math.min(maskW, Math.ceil((b.cx + b.w / 2) * maskScaleX));
          const top = Math.max(0, Math.floor((b.cy - b.h / 2) * maskScaleY));
          const bottom = Math.min(maskH, Math.ceil((b.cy + b.h / 2) * maskScaleY));

          const colors = [
            [73, 174, 174],
            [255, 80, 80],
            [0, 255, 153],
            [255, 153, 0],
            [153, 0, 255]
          ];
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
          ctx.drawImage(cachedMaskCanvas!, 0, 0, maskW, maskH, 0, 0, canvasWidth, canvasHeight);
        }
      }

      // Draw bounding box + labels
      if (showLabels || showConf) {
        const x = b.cx - b.w / 2;
        const y = b.cy - b.h / 2;
        const coralColor = '#FF5050';
        
        ctx.strokeStyle = coralColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, b.w, b.h);
        
        let labelStr = `OBJ ${b.classId}`;
        if (metadata.labels && metadata.labels.length > b.classId) {
          labelStr = metadata.labels[b.classId];
        }
        
        let text = '';
        if (showLabels) text += labelStr.toUpperCase();
        if (showLabels && showConf) text += ' ';
        if (showConf) text += `${(b.conf * 100).toFixed(0)}%`;
        
        ctx.font = '10px monospace';
        const textWidth = ctx.measureText(text).width;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y - 18, textWidth + 8, 18);
        
        ctx.fillStyle = coralColor;
        ctx.fillText(text, x + 4, y - 5);
      }
    }
  }
}
