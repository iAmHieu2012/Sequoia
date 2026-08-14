import { ModelMetadata, PlaygroundParams, ParsedResult } from '@/types/playground';
import { TaskRenderer } from './types';

export class ClassificationRenderer implements TaskRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    result: ParsedResult,
    params: PlaygroundParams,
    metadata: ModelMetadata,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    if (result.type !== 'classification') return;
    
    let yOffset = 30;
    
    for (let i = 0; i < result.topK.length; i++) {
      const item = result.topK[i];
      const text = `[TOP ${i + 1}] ${item.label.toUpperCase()} (${(item.confidence * 100).toFixed(1)}%)`;
      
      ctx.font = 'bold 14px monospace';
      const textWidth = ctx.measureText(text).width;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, yOffset, textWidth + 20, 28);
      
      ctx.fillStyle = '#49AEAE';
      ctx.fillText(text, 20, yOffset + 19);
      
      yOffset += 32;
    }
  }
}
