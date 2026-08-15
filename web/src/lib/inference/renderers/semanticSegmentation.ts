import { ModelMetadata, PlaygroundParams, ParsedResult } from '@/types/playground';
import { TaskRenderer } from './types';

export class SemanticSegmentationRenderer implements TaskRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    result: ParsedResult,
    params: PlaygroundParams,
    metadata: ModelMetadata,
    canvasWidth: number,
    canvasHeight: number,
    protoData?: Float32Array | null,
    protoShape?: number[],
    mediaSource?: HTMLVideoElement | HTMLImageElement
  ): void {
    if (result.type !== 'semantic-segmentation') return;
    
    const maskOpacity = (params.mask_opacity as number) ?? 0.6;
    
    let tempCanvas = document.createElement('canvas');
    tempCanvas.width = result.width;
    tempCanvas.height = result.height;
    let tempCtx = tempCanvas.getContext('2d');
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
      // Normal colored mask overlay
      ctx.globalAlpha = maskOpacity;
      ctx.drawImage(tempCanvas, 0, 0, result.width, result.height, 0, 0, canvasWidth, canvasHeight);
      ctx.globalAlpha = 1.0;
    }
  }
}
