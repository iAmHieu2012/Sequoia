import { ModelMetadata, PlaygroundParams, ParsedResult } from '@/types/playground';
import { TaskRenderer } from './types';
import { RENDERER_THEME } from './theme';

/**
 * Renderer for OCR and text detection results.
 * Draws text bounding polygons and the recognized text.
 */
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
      ctx.strokeStyle = RENDERER_THEME.colors.coral;
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
      
      const scale = Math.max(canvasWidth, canvasHeight) / 640;
      const fontSize = Math.floor(12 * scale);
      const boxHeight = Math.floor(20 * scale);
      const padding = Math.floor(4 * scale);
      const textOffsetY = Math.floor(5 * scale);

      let text = item.text;
      if (showConf) text += ` (${(item.conf * 100).toFixed(0)}%)`;
      
      ctx.font = `bold ${fontSize}px monospace`;
      const textWidth = ctx.measureText(text).width;
      
      // Prevent label from drawing outside the top of the canvas
      const labelY = Math.max(boxHeight, minY);

      ctx.fillStyle = RENDERER_THEME.colors.textBg;
      ctx.fillRect(minX, labelY - boxHeight, textWidth + padding * 2, boxHeight);
      
      ctx.fillStyle = RENDERER_THEME.colors.teal;
      ctx.fillText(text, minX + padding, labelY - textOffsetY);
    }
  }
}
