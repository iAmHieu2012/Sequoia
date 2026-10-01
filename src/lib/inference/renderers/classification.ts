
import { TaskRenderer, RenderOptions } from './types';
import { RENDERER_THEME } from './theme';

/**
 * Renderer for image classification results.
 * Draws the top-K predicted classes and their confidence scores.
 */
export class ClassificationRenderer implements TaskRenderer {
  render({ ctx, result, canvasWidth, canvasHeight }: RenderOptions): void {
    if (result.type !== 'classification') return;
    
    const scale = Math.max(canvasWidth, canvasHeight) / 640;
    const fontSize = Math.floor(14 * scale);
    const paddingX = Math.floor(10 * scale);
    const boxHeight = Math.floor(28 * scale);
    const textOffsetY = Math.floor(19 * scale);
    let yOffset = Math.floor(30 * scale);
    
    for (let i = 0; i < result.topK.length; i++) {
      const item = result.topK[i];
      const text = `[TOP ${i + 1}] ${item.label.toUpperCase()} (${(item.confidence * 100).toFixed(1)}%)`;
      
      ctx.font = `bold ${fontSize}px monospace`;
      const textWidth = ctx.measureText(text).width;
      
      ctx.fillStyle = RENDERER_THEME.colors.textBg;
      ctx.fillRect(paddingX, yOffset, textWidth + paddingX * 2, boxHeight);
      
      ctx.fillStyle = RENDERER_THEME.colors.teal;
      ctx.fillText(text, paddingX * 2, yOffset + textOffsetY);
      
      yOffset += boxHeight + Math.floor(4 * scale);
    }
  }
}
