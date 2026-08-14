import { ModelMetadata, PlaygroundParams, ParsedResult } from '@/types/playground';
import { TaskRenderer } from './types';

export class OcrRenderer implements TaskRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    result: ParsedResult,
    params: PlaygroundParams,
    metadata: ModelMetadata,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    if (result.type !== 'ocr') return;
    
    const showConf = params.show_confidence !== false;
    
    for (const item of result.texts) {
      if (item.polygon.length < 3) continue;
      
      // Draw polygon
      ctx.strokeStyle = '#FF5050';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(item.polygon[0].x, item.polygon[0].y);
      for (let i = 1; i < item.polygon.length; i++) {
        ctx.lineTo(item.polygon[i].x, item.polygon[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      
      // Draw text
      const minX = Math.min(...item.polygon.map(p => p.x));
      const minY = Math.min(...item.polygon.map(p => p.y));
      
      let text = item.text;
      if (showConf) text += ` (${(item.conf * 100).toFixed(0)}%)`;
      
      ctx.font = 'bold 12px monospace';
      const textWidth = ctx.measureText(text).width;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(minX, minY - 20, textWidth + 8, 20);
      
      ctx.fillStyle = '#49AEAE';
      ctx.fillText(text, minX + 4, minY - 5);
    }
  }
}
