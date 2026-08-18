import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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

export default function useCosmosData(mapId?: string, refreshKey?: number, skipProgressFetch: boolean = false) {
  const { user } = useAuth();
  const [mapCache, setMapCache] = useState<{ id: string | undefined, data: CosmosMap | null }>({ id: undefined, data: null });
  const [progressCache, setProgressCache] = useState<{ userId: string | undefined, data: UserProgress | null }>({ userId: undefined, data: null });

  const mapData = mapCache.id === mapId ? mapCache.data : null;
  const userProgress = progressCache.userId === user?.id ? progressCache.data : null;

  useEffect(() => {
    if (!mapId) return;
    
    let isMounted = true;
    const fetchMap = async () => {
      try {
        const res = await fetch(`/api/v1/cosmos/maps/${mapId}`);
        const data = await res.json();
        if (isMounted) setMapCache({ id: mapId, data: data.data || null });
      } catch (error: unknown) {
        console.error(error);
        if (isMounted) setMapCache({ id: mapId, data: null });
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
        const res = await fetch(`/api/v1/users/progress?localDate=${localDate}`);
        const data = await res.json();
        if (isMounted) setProgressCache({ userId: user.id, data: data.data || null });
      } catch (error: unknown) {
        console.error(error);
        console.error('User not authenticated or no progress yet');
        if (isMounted) setProgressCache({ userId: user.id, data: null });
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

  return { mapData, userProgress, getNodeStatus };
}
