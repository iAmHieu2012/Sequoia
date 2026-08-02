import { BoundingBox } from './types';

let cachedMaskCanvas: HTMLCanvasElement | null = null;
let cachedMaskCtx: CanvasRenderingContext2D | null = null;

export function renderSegmentation(
  dCtx: CanvasRenderingContext2D,
  b: BoundingBox,
  protoData: Float32Array | null,
  protoShape: number[],
  canvasWidth: number,
  canvasHeight: number
) {
  if (!b.maskCoeffs) return;
  if (!protoData) {
    dCtx.fillStyle = '#00F0FF';
    dCtx.fillText("ERR: NO PROTOTYPE TENSOR", b.cx - b.w / 2, b.cy - b.h / 2 - 20);
    return;
  }

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
  if (!maskCtx) return;

  const imgData = maskCtx.createImageData(maskW, maskH);
  
  const maskScaleX = maskW / canvasWidth;
  const maskScaleY = maskH / canvasHeight;
  const left = Math.max(0, Math.floor((b.cx - b.w / 2) * maskScaleX));
  const right = Math.min(maskW, Math.ceil((b.cx + b.w / 2) * maskScaleX));
  const top = Math.max(0, Math.floor((b.cy - b.h / 2) * maskScaleY));
  const bottom = Math.min(maskH, Math.ceil((b.cy + b.h / 2) * maskScaleY));

  const colors = [
    [255, 51, 102], [0, 240, 255], [0, 255, 128], [255, 200, 0], [200, 0, 255]
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
        imgData.data[idx+3] = 160;
      }
    }
  }
  maskCtx.putImageData(imgData, 0, 0);
  dCtx.drawImage(cachedMaskCanvas!, 0, 0, maskW, maskH, 0, 0, canvasWidth, canvasHeight);
}
