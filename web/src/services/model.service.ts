import { AiModel } from "@/types/dashboard";

/**
 * Service for interacting with AI Model-related API endpoints.
 */
export const ModelService = {
  /**
   * Fetches all available AI models for the playground.
   * @returns A promise that resolves to an array of AI Models.
   */
  getModels: async (): Promise<AiModel[]> => {
    const res = await fetch('/api/v1/models');
    if (!res.ok) throw new Error('Failed to fetch models');
    const json = await res.json();
    return json.data || [];
  }
};
