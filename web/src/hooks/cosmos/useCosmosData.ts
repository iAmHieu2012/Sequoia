import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CosmosService } from '@/services/cosmos.service';
import { UserService } from '@/services/user.service';

export interface CosmosNode {
  article_id: string;
  title: string;
  celestial_type: string;
  x: number;
  y: number;
  connections: string[];
}

export interface CosmosMap {
  id: string;
  map_type: string;
  theme: string;
  nodes: CosmosNode[];
}

export interface UserProgress {
  id: string;
  completed_article_ids: string[];
  current_streak?: number;
  longest_streak?: number;
  active_dates?: string[];
}

/**
 * Custom hook to fetch and cache Cosmos Map spatial data and User Progress.
 * @param mapId The ID of the map to load
 * @param refreshKey A trigger value to force a refetch
 * @param skipProgressFetch If true, ignores fetching the user's progress
 */
export function useCosmosData(mapId?: string, refreshKey?: number, skipProgressFetch: boolean = false) {
  const { user } = useAuth();
  const [mapCache, setMapCache] = useState<{ id: string | undefined, data: CosmosMap | null }>({ id: undefined, data: null });
  const [progressCache, setProgressCache] = useState<{ userId: string | undefined, data: UserProgress | null }>({ userId: undefined, data: null });
  const [error, setError] = useState<string | null>(null);

  const mapData = mapCache.id === mapId ? mapCache.data : null;
  const userProgress = progressCache.userId === user?.id ? progressCache.data : null;

  useEffect(() => {
    if (!mapId) return;
    
    let isMounted = true;
    const fetchMap = async () => {
      try {
        const data = await CosmosService.getMapData(mapId);
        if (isMounted) setMapCache({ id: mapId, data });
      } catch (err) {
        if (isMounted) setError('Failed to fetch cosmos map data');
        console.error(err);
      }
    };
    fetchMap();
    return () => { isMounted = false; };
  }, [mapId, refreshKey]);

  useEffect(() => {
    if (!user || skipProgressFetch) return;
    
    let isMounted = true;
    const fetchProgress = async () => {
      try {
        const localDate = new Date().toLocaleDateString('en-CA');
        const data = await UserService.getUserProgress(localDate);
        if (isMounted) setProgressCache({ userId: user.id, data });
      } catch (err) {
        if (isMounted) setError('Failed to fetch user progress');
        console.error(err);
      }
    };
    fetchProgress();
    return () => { isMounted = false; };
  }, [user, skipProgressFetch]);

  const getNodeStatus = useCallback((article_id: string) => {
    if (!userProgress) return false;
    const arr = userProgress.completed_article_ids;
    return arr?.includes(article_id) || false;
  }, [userProgress]);

  return { mapData, userProgress, getNodeStatus, error };
}
