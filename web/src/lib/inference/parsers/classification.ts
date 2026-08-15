import { ModelMetadata, PlaygroundParams, ParsedClassificationResult } from '@/types/playground';
import { OutputParser } from './types';

/**
 * Parser for classification output format.
 * Output tensor layout: [batch, num_classes] — a flat softmax/logit vector.
 */
export class ClassificationParser implements OutputParser {
  parse(
    rawData: Float32Array,
    shape: number[],
    taskType: string,
    params: PlaygroundParams,
    metadata: ModelMetadata,
    scaleX: number,
    scaleY: number
  ): ParsedClassificationResult {
    const topK = (params.top_k as number) || 5;
    const numClasses = shape[shape.length - 1];
    
    let sum = 0;
    let maxLogit = -Infinity;
    for (let i = 0; i < numClasses; i++) {
      sum += rawData[i];
      if (rawData[i] > maxLogit) maxLogit = rawData[i];
    }

    // Check if the output is already softmaxed (sum is roughly 1.0)
    const isSoftmax = Math.abs(sum - 1.0) < 0.1 && maxLogit <= 1.0 && rawData.every((v: number) => v >= 0);

    let expSum = 0;
    const expScores = new Float32Array(numClasses);
    if (!isSoftmax) {
      for (let i = 0; i < numClasses; i++) {
        const expVal = Math.exp(rawData[i] - maxLogit);
        expScores[i] = expVal;
        expSum += expVal;
      }
    }

    const scores = [];
    for (let i = 0; i < numClasses; i++) {
      let conf = isSoftmax ? rawData[i] : expScores[i] / expSum;
      scores.push({ classId: i, confidence: conf });
    }
    
    scores.sort((a, b) => b.confidence - a.confidence);
    
    const results = [];
    for (let i = 0; i < Math.min(topK, scores.length); i++) {
      let label = `CLASS ${scores[i].classId}`;
      if (metadata.labels && metadata.labels.length > scores[i].classId) {
        label = metadata.labels[scores[i].classId];
      }
      results.push({
        classId: scores[i].classId,
        label,
        confidence: scores[i].confidence
      });
    }

    return {
      type: 'classification',
      topK: results,
      count: results.length
    };
  }
}
