
import { TaskRenderer, RenderOptions } from './types';

/**
 * Renderer for semantic segmentation and background removal tasks.
 * Draws a full-image mask overlay or handles alpha-matte background removal.
 */
export class SemanticSegmentationRenderer implements TaskRenderer {
  private tempCanvas: HTMLCanvasElement | null = null;
  private tempCtx: CanvasRenderingContext2D | null = null;

  render({ ctx, result, metadata, canvasWidth, canvasHeight, mediaSource }: RenderOptions): void {
    if (result.type !== 'semantic-segmentation') return;
    
    if (!this.tempCanvas || this.tempCanvas.width !== result.width || this.tempCanvas.height !== result.height) {
      this.tempCanvas = document.createElement('canvas');
      this.tempCanvas.width = result.width;
      this.tempCanvas.height = result.height;
      this.tempCtx = this.tempCanvas.getContext('2d');
    }
    
    const tempCanvas = this.tempCanvas;
    const tempCtx = this.tempCtx;
    if (!tempCtx) return;
    
    let imageData: ImageData;
    if (result.maskData instanceof ImageData) {
      imageData = result.maskData;
    } else {
      imageData = new ImageData(new Uint8ClampedArray(result.maskData as unknown as ArrayLike<number>), result.width, result.height);
    }
    
    tempCtx.putImageData(imageData, 0, 0);
    
    if (mediaSource && metadata.visualization.type === 'background_removal') {
      // Background removal mode (alpha matte)
      ctx.drawImage(mediaSource, 0, 0, canvasWidth, canvasHeight);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(tempCanvas, 0, 0, result.width, result.height, 0, 0, canvasWidth, canvasHeight);
      ctx.globalCompositeOperation = 'source-over';
    } else {
      // Normal colored mask overlay. Opacity is already baked into the mask's alpha by the parser
      // (from the mask_opacity param), so it must not be applied a second time here.
      ctx.drawImage(tempCanvas, 0, 0, result.width, result.height, 0, 0, canvasWidth, canvasHeight);
    }
  }
}
