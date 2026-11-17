/**
 * A textbook: metadata plus a link to its PDF.
 */
export interface Textbook {
  id: string;
  title: string;
  description: string;
  pdf_url?: string;
  cover_image_url?: string;
  authors: string[];
}

/**
 * Represents a Nebula (Knowledge Topic) containing a collection of articles.
 */
export interface Topic {
  id: string;
  name: string;
  description: string;
  article_count: number;
}

/**
 * A single article, either inside a Topic or standalone ("rogue", topic_id = null).
 */
export interface Article {
  is_published?: boolean;
  tags?: string[];
  file_size_bytes?: number;
  id: string;
  title: string;
  summary: string;
}

/**
 * Tracks the completion ratio for a specific category (e.g. 5/10 articles completed).
 */
export interface CategoryProgress {
  total: number;
  completed: number;
}

/**
 * Summarizes a user's progress across Topics and Standalone Articles.
 * Matches the response of GET /api/v1/users/progress/summary.
 */
export interface ProgressSummary {
  topics: Record<string, CategoryProgress>;
  standalone: Record<string, boolean>;
}

/**
 * Represents an executable AI Model that can be run in the Inference Lab.
 */
export interface AiModel {
  file_size_bytes?: number;
  id: string;
  name: string;
  description: string;
  task_type: string;
  file_url: string;
  version: string;
  format: string;
}
