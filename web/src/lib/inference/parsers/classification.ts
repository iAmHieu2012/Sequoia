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
    
    const scores = [];
    for (let i = 0; i < numClasses; i++) {
      let conf = rawData[i];
      // Apply sigmoid if raw logits
      if (conf > 1.5 || conf < 0) {
        conf = 1 / (1 + Math.exp(-conf));
      }
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
