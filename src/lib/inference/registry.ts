import { OutputParser, getParser } from './parsers';
import { TaskRenderer, getRenderer } from './renderers';

/**
 * Single entry point for the inference pipeline: getParser picks a parser by the model's
 * output_format, getRenderer picks a renderer by its task_type.
 */

export { getParser, getRenderer };
export type { OutputParser, TaskRenderer };
