import { Textbook } from "@/types/dashboard";

/**
 * Service for interacting with Textbook-related API endpoints.
 */
export const TextbookService = {
  /**
   * Fetches all active textbooks available in the system.
   * @returns A promise that resolves to an array of Textbooks.
   */
  getTextbooks: async (): Promise<Textbook[]> => {
    const res = await fetch('/api/v1/textbooks');
    if (!res.ok) throw new Error('Failed to fetch textbooks');
    const json = await res.json();
    return json.data || [];
  }
};
