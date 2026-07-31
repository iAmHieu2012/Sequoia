import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface CosmosNode {
  articleId: string;
  title: string;
  celestialType: string;
  x: number;
  y: number;
  connections: string[];
}

export interface CosmosMap {
  id: string;
  mapType: string;
  theme: string;
  nodes: CosmosNode[];
}

export interface UserProgress {
  userId: string;
  completedArticleIds: string[];
  currentStreak?: number;
  longestStreak?: number;
  activeDates?: string[];
}

export default function useCosmosData(mapId?: string) {
  const [mapData, setMapData] = useState<CosmosMap | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    if (mapId) {
      const fetchMap = async () => {
        try {
          const res = await fetch(`/api/v1/cosmos/maps/${mapId}`);
          const data = await res.json();
          if (data.data) {
            setMapData(data.data);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchMap();
    }
  }, [mapId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          // Extract the local date string (YYYY-MM-DD) natively
          const localDate = new Date().toLocaleDateString('en-CA');
          
          const res = await fetch(`/api/v1/users/progress?localDate=${localDate}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.data) {
            setUserProgress(data.data);
          }
        } catch (err) {
          console.error('User not authenticated or no progress yet');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const getNodeStatus = useCallback((articleId: string) => {
    if (!userProgress) return false;
    return userProgress.completedArticleIds?.includes(articleId);
  }, [userProgress]);

  return { mapData, userProgress, getNodeStatus };
}
