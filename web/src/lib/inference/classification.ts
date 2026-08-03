
export function renderClassification(
  dCtx: CanvasRenderingContext2D,
  outData: Float32Array,
  outShape: number[],
  modelLabels: string[],
  canvasWidth: number
) {
  const numClasses = outShape[outShape.length - 1];
  let maxConf = -Infinity;
  let classId = -1;
  
  for (let i = 0; i < numClasses; i++) {
    if (outData[i] > maxConf) { maxConf = outData[i]; classId = i; }
  }
  
  // Raw logits need sigmoid/softmax approximation
  if (maxConf > 1.5 || maxConf < 0) {
     maxConf = 1 / (1 + Math.exp(-maxConf));
  }

  if (classId !== -1) {
    let label = `CLASS ${classId}`;
    if (modelLabels && modelLabels.length > classId) {
      label = modelLabels[classId];
    }
    
    dCtx.font = 'bold 14px monospace';
    const text = `[TOP 1] ${label.toUpperCase()} (${(maxConf*100).toFixed(1)}%)`;
    const textWidth = dCtx.measureText(text).width;
    
    dCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    dCtx.fillRect(10, 30, textWidth + 20, 28);
    
    dCtx.fillStyle = '#49AEAE';
    dCtx.fillText(text, 20, 49);
  }
}
