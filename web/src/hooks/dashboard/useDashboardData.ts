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
  const [loadingModels, setLoadingModels] = useState(false);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);

  // Fetch Core Dashboard Data (Topics, Rogue Articles, Textbooks)
  useEffect(() => {
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

        setTopics(tpJson.data || []);
        setRogueArticles(rogueJson.data || []);
        if (tbJson.data) setTextbooks(tbJson.data);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Fetch AI Models
  useEffect(() => {
    if (models.length === 0) {
      setLoadingModels(true);
      fetch('/api/v1/models')
        .then(res => res.json())
        .then(data => {
          setModels(data.data || []);
          setLoadingModels(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingModels(false);
        });
    }
  }, [activeTab, models.length]);

  // Fetch User Progress Summary when user is available
  useEffect(() => {
    if (!user) {
      setProgressSummary(null);
      return;
    }

    const fetchProgress = async () => {
      try {
        const token = await user.getIdToken();
        const progressRes = await fetch('/api/v1/users/progress/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const progressJson = await progressRes.json();
        if (progressJson.data) {
          setProgressSummary(progressJson.data);
        }
      } catch (e) {
        console.error('Progress summary fetch failed', e);
      }
    };

    fetchProgress();
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
