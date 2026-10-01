import { OutputParser, getParser } from './parsers';
import { TaskRenderer, getRenderer } from './renderers';

/**
 * Global Registry for AI Inference Pipelines.
 * Centralized barrel file that exports the factory functions needed to 
 * resolve and instantiate the correct Parser and Renderer for any given AI task.
 */

export { getParser, getRenderer };
export type { OutputParser, TaskRenderer };
