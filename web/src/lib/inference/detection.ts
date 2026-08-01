import { BoundingBox } from './types';

export function renderDetection(
  dCtx: CanvasRenderingContext2D,
  b: BoundingBox,
  numClasses: number,
  modelLabels?: string[]
) {
  const x = b.cx - b.w / 2;
  const y = b.cy - b.h / 2;
  
  dCtx.strokeStyle = '#FF3366';
  dCtx.lineWidth = 2;
  dCtx.strokeRect(x, y, b.w, b.h);
  
  let label = `OBJ ${b.classId}`;
  if (modelLabels && modelLabels.length > b.classId) {
    label = modelLabels[b.classId];
  }
  
  dCtx.fillStyle = '#FF3366';
  dCtx.font = 'bold 14px monospace';
  dCtx.fillText(`${label.toUpperCase()} ${(b.conf * 100).toFixed(0)}%`, x, y - 8);
}
