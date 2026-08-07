export interface Textbook {
  id: string;
  title: string;
  description: string;
  authors: string[];
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  articleCount: number;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  articleCount: number;
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
  taskType: string;
  fileUrl: string;
  version: string;
  format: string;
}
