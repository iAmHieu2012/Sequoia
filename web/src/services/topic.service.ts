import { Article, Topic } from "@/types/dashboard";

/**
 * Service for interacting with Topic-related API endpoints.
 */
export const TopicService = {
  /**
   * Fetches all articles belonging to a specific topic.
   * @param topicId The unique identifier of the topic.
   * @returns A promise that resolves to an array of Articles.
   */
  getArticlesByTopic: async (topicId: string): Promise<Article[]> => {
    const res = await fetch(`/api/v1/topics/${topicId}/articles`);
    if (!res.ok) {
      throw new Error(`Failed to fetch articles for topic ${topicId}`);
    }
    const json = await res.json();
    return json.data || [];
  },

  /**
   * Fetches all available topics.
   * @returns A promise that resolves to an array of Topics.
   */
  getTopics: async (): Promise<Topic[]> => {
    const res = await fetch('/api/v1/topics');
    if (!res.ok) throw new Error('Failed to fetch topics');
    const json = await res.json();
    return json.data || [];
  }
};
