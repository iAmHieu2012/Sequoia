
import { TaskRenderer, RenderOptions } from './types';

/**
 * Renderer for image-to-image tasks (e.g., style transfer, super-resolution).
 * Draws the processed image tensor directly onto the canvas.
 */
export class ImageToImageRenderer implements TaskRenderer {
  private tempCanvas: HTMLCanvasElement | null = null;
  private tempCtx: CanvasRenderingContext2D | null = null;

  render({ ctx, result, canvasWidth, canvasHeight }: RenderOptions): void {
    if (result.type !== 'image-to-image') return;
    
    if (!this.tempCanvas || this.tempCanvas.width !== result.width || this.tempCanvas.height !== result.height) {
      this.tempCanvas = document.createElement('canvas');
      this.tempCanvas.width = result.width;
      this.tempCanvas.height = result.height;
      this.tempCtx = this.tempCanvas.getContext('2d');
    }
    
    const tempCanvas = this.tempCanvas;
    const tempCtx = this.tempCtx;
    if (!tempCtx) return;
    
    tempCtx.putImageData(result.imageData, 0, 0);
    
    ctx.drawImage(tempCanvas, 0, 0, result.width, result.height, 0, 0, canvasWidth, canvasHeight);
  }
}
