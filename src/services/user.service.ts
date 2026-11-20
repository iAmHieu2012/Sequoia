import { apiFetch } from "@/lib/apiFetch";
import { UserProgress } from "@/hooks/cosmos/useCosmosData";
import { ProgressSummary } from "@/types/dashboard";

/**
 * Service for interacting with User-related API endpoints.
 */
export const UserService = {
  /**
   * Fetches the learning progress and streak data for the authenticated user (read-only).
   * @returns A promise resolving to the user's progress data, or null.
   */
  getUserProgress: async (): Promise<UserProgress | null> => {
    const res = await apiFetch('/api/v1/users/progress');
    if (!res.ok) throw new Error('Failed to fetch user progress');
    const json = await res.json();
    return json.data || null;
  },

  /**
   * Records today as an active day for the streak.
   * @returns The updated progress, or null.
   */
  recordActivity: async (): Promise<UserProgress | null> => {
    // YYYY-MM-DD in the user's timezone, so the streak follows their calendar day.
    const localDate = new Date().toLocaleDateString('en-CA');
    const res = await apiFetch('/api/v1/users/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localDate }),
    });
    if (!res.ok) throw new Error('Failed to record activity');
    const json = await res.json();
    return json.data || null;
  },

  /**
   * Fetches the user's global progress summary.
   * @returns A promise resolving to the ProgressSummary object, or null.
   */
  getUserProgressSummary: async (): Promise<ProgressSummary | null> => {
    const res = await apiFetch('/api/v1/users/progress/summary');
    if (!res.ok) throw new Error('Failed to fetch progress summary');
    const json = await res.json();
    return json.data || null;
  }
};
