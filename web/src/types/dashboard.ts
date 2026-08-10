export interface Textbook {
  id: string;
  title: string;
  description: string;
  pdf_url?: string;
  cover_image_url?: string;
  authors: string[];
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  article_count: number;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  article_count: number;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
}

export interface CategoryProgress {
  total: number;
  completed: number;
}

export interface ProgressSummary {
  textbooks: Record<string, CategoryProgress>;
  topics: Record<string, CategoryProgress>;
  standalone: Record<string, boolean>;
}

export interface AiModel {
  id: string;
  name: string;
  description: string;
  task_type: string;
  file_url: string;
  version: string;
  format: string;
}
