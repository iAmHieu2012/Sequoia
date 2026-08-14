import { ModelMetadata, PlaygroundParams, ParsedResult } from '@/types/playground';
import { TaskRenderer } from './types';

export class DetectionRenderer implements TaskRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    result: ParsedResult,
    params: PlaygroundParams,
    metadata: ModelMetadata,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    if (result.type !== 'detection') return;
    
    const showLabels = params.show_labels !== false;
    const showConf = params.show_confidence !== false;
    const maxDetections = (params.max_detections as number) || result.boxes.length;
    const boxes = result.boxes.slice(0, maxDetections);
    
    for (const b of boxes) {
      const x = b.cx - b.w / 2;
      const y = b.cy - b.h / 2;
      const cLen = Math.min(15, b.w * 0.25, b.h * 0.25);
      const coralColor = '#FF5050';
      
      // Corner brackets
      ctx.strokeStyle = coralColor;
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(x, y + cLen); ctx.lineTo(x, y); ctx.lineTo(x + cLen, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + b.w - cLen, y); ctx.lineTo(x + b.w, y); ctx.lineTo(x + b.w, y + cLen);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, y + b.h - cLen); ctx.lineTo(x, y + b.h); ctx.lineTo(x + cLen, y + b.h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + b.w - cLen, y + b.h); ctx.lineTo(x + b.w, y + b.h); ctx.lineTo(x + b.w, y + b.h - cLen);
      ctx.stroke();

      // Faint inner box
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = coralColor;
      ctx.strokeRect(x, y, b.w, b.h);
      ctx.globalAlpha = 1.0;
      
      if (showLabels || showConf) {
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
