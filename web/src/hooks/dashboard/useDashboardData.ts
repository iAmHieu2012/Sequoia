import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Topic, Article, Textbook, AiModel, ProgressSummary } from '@/types/dashboard';

export function useDashboardData(activeTab: string) {
  const { user } = useAuth();
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [rogueArticles, setRogueArticles] = useState<Article[]>([]);
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [models, setModels] = useState<AiModel[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingModels, setLoadingModels] = useState(true);
  const [progressCache, setProgressCache] = useState<{ userId: string | undefined, data: ProgressSummary | null }>({ userId: undefined, data: null });
  const progressSummary = progressCache.userId === user?.id ? progressCache.data : null;

  // Fetch Core Dashboard Data (Topics, Rogue Articles, Textbooks)
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const [tpRes, rogueRes, tbRes] = await Promise.all([
          fetch('/api/v1/topics'),
          fetch('/api/v1/articles/standalone'),
          fetch('/api/v1/textbooks')
        ]);
        
        const tpJson = await tpRes.json();
        const rogueJson = await rogueRes.json();
        const tbJson = await tbRes.json();

        if (isMounted) {
          setTopics(tpJson.data || []);
          setRogueArticles(rogueJson.data || []);
          if (tbJson.data) setTextbooks(tbJson.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, []);

  // Fetch AI Models
  useEffect(() => {
    let isMounted = true;
    if (models.length === 0) {
      fetch('/api/v1/models')
        .then(res => res.json())
        .then(data => {
          if (isMounted) {
            setModels(data.data || []);
            setLoadingModels(false);
          }
        })
        .catch(err => {
          console.error(err);
          if (isMounted) setLoadingModels(false);
        });
    }
    return () => { isMounted = false; };
  }, [activeTab, models.length]);

  // Fetch User Progress Summary when user is available
  useEffect(() => {
    if (!user) return;
    
    let isMounted = true;
    const fetchProgress = async () => {
      try {
        const progressRes = await fetch('/api/v1/users/progress/summary');
        const progressJson = await progressRes.json();
        if (isMounted) setProgressCache({ userId: user.id, data: progressJson.data || null });
      } catch (e) {
        console.error('Progress summary fetch failed', e);
        if (isMounted) setProgressCache({ userId: user.id, data: null });
      }
    };

    fetchProgress();
    return () => { isMounted = false; };
  }, [user]);

  return {
    topics,
    rogueArticles,
    textbooks,
    models,
    progressSummary,
    loading,
    loadingModels
  };
}
