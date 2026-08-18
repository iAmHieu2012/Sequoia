import { UserProgress } from "@/hooks/cosmos/useCosmosData";
import { ProgressSummary } from "@/types/dashboard";

/**
 * Service for interacting with User-related API endpoints.
 */
export const UserService = {
  /**
   * Fetches the learning progress and streak data for the authenticated user.
   * @param localDate The user's local date string (YYYY-MM-DD) for streak calculation.
   * @returns A promise resolving to the user's progress data, or null.
   */
  getUserProgress: async (localDate: string): Promise<UserProgress | null> => {
    try {
      const res = await fetch(`/api/v1/users/progress?localDate=${localDate}`);
      if (!res.ok) throw new Error('Failed to fetch user progress');
      const json = await res.json();
      return json.data || null;
    } catch (error) {
      console.error('UserService Error:', error);
      return null;
    }
  },

  /**
   * Fetches the user's global progress summary.
   * @returns A promise resolving to the ProgressSummary object, or null.
   */
  getUserProgressSummary: async (): Promise<ProgressSummary | null> => {
    try {
      const res = await fetch('/api/v1/users/progress/summary');
      if (!res.ok) throw new Error('Failed to fetch progress summary');
      const json = await res.json();
      return json.data || null;
    } catch (error) {
      console.error('UserService Error:', error);
      return null;
    }
  }
};
