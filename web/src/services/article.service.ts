import { Article } from "@/types/dashboard";

/**
 * Service for interacting with Article-related API endpoints.
 */
export const ArticleService = {
  /**
   * Fetches all standalone (rogue) articles that are not attached to any topic.
   * @returns A promise that resolves to an array of standalone Articles.
   */
  getStandaloneArticles: async (): Promise<Article[]> => {
    const res = await fetch('/api/v1/articles/standalone');
    if (!res.ok) throw new Error('Failed to fetch standalone articles');
    const json = await res.json();
    return json.data || [];
  },

  /**
   * Updates the completion status of a specific article for the authenticated user.
   * @param articleId The ID of the article to update.
   * @param completed The target completion status.
   * @returns A promise that resolves when the update is successful.
   */
  updateArticleProgress: async (articleId: string, completed: boolean): Promise<void> => {
    const res = await fetch(`/api/v1/articles/${articleId}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ completed })
    });
    
    if (!res.ok) {
      throw new Error(`Failed to update article progress for ${articleId}`);
    }
  }
};
