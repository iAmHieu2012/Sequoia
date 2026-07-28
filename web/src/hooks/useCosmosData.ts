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
  decodingArticleIds: string[];
}

export default function useCosmosData(mapId?: string) {
  const [mapData, setMapData] = useState<CosmosMap | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    if (!mapId) return;

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

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch(`/api/v1/users/progress`, {
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

    fetchMap();
    return () => unsubscribe();
  }, [mapId]);

  const getNodeStatus = useCallback((articleId: string) => {
    if (!userProgress) return 'locked';
    if (userProgress.completedArticleIds?.includes(articleId)) return 'decoded';
    if (userProgress.decodingArticleIds?.includes(articleId)) return 'decoding';
    return 'locked';
  }, [userProgress]);

  return { mapData, userProgress, getNodeStatus };
}
