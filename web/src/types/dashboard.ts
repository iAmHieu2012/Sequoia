/**
 * Represents a learning module or textbook containing multiple chapters.
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
 * Represents an individual learning unit, which can be part of a Topic, Chapter, or standalone (Rogue).
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
 * Summarizes a user's global progress across all Textbooks, Topics, and Standalone Articles.
 */
export interface ProgressSummary {
  textbooks: Record<string, CategoryProgress>;
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
