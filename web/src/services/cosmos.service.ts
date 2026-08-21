import { CosmosMap } from "@/hooks/cosmos/useCosmosData";

/**
 * Service for interacting with Cosmos Map related API endpoints.
 */
export const CosmosService = {
  /**
   * Fetches spatial map data (nodes and edges) for a given map ID.
   * @param mapId The unique identifier of the Cosmos map to retrieve.
   * @returns A promise that resolves to a CosmosMap object or null if failed.
   */
  getMapData: async (mapId: string): Promise<CosmosMap | null> => {
    const res = await fetch(`/api/v1/cosmos/maps/${mapId}`);
    if (!res.ok) throw new Error(`Failed to fetch map data for ${mapId}`);
    const json = await res.json();
    return json.data || null;
  }
};
