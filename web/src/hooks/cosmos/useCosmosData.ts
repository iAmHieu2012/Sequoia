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

export default function useCosmosData(mapId?: string, refreshKey?: number) {
  const { user } = useAuth();
  const [mapData, setMapData] = useState<CosmosMap | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    if (mapId) {
      setMapData(null); // Clear previous map while fetching
      const fetchMap = async () => {
        try {
          const res = await fetch(`/api/v1/cosmos/maps/${mapId}`);
          const data = await res.json();
          if (data.data) {
            setMapData(data.data);
          } else {
            setMapData(null);
          }
        } catch (err) {
          console.error(err);
          setMapData(null);
        }
      };
      fetchMap();
    } else {
      setMapData(null);
    }
  }, [mapId, refreshKey]);

  useEffect(() => {
    if (user) {
      const fetchProgress = async () => {
        try {
          const localDate = new Date().toLocaleDateString('en-CA');
          const res = await fetch(`/api/v1/users/progress?localDate=${localDate}`);
          const data = await res.json();
          if (data.data) {
            setUserProgress(data.data);
          }
        } catch (err) {
          console.error('User not authenticated or no progress yet');
        }
      };
      fetchProgress();
    } else {
      setUserProgress(null);
    }
  }, [user]);

  const getNodeStatus = useCallback((article_id: string) => {
    if (!userProgress) return false;
    const arr = userProgress.completed_article_ids;
    return arr?.includes(article_id) || false;
  }, [userProgress]);

  return { mapData, userProgress, getNodeStatus };
}
