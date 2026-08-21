import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Topic, Article, Textbook, AiModel, ProgressSummary } from '@/types/dashboard';
import { TopicService } from '@/services/topic.service';
import { ArticleService } from '@/services/article.service';
import { TextbookService } from '@/services/textbook.service';
import { ModelService } from '@/services/model.service';
import { UserService } from '@/services/user.service';

/**
 * Custom hook to manage the fetching and state of all core Dashboard data.
 * Aggregates Topics, Standalone Articles, Textbooks, AI Models, and User Progress.
 * @param activeTab Current active tab ID to conditionally fetch heavy resources
 */
export function useDashboardData(activeTab: string) {
  const { user } = useAuth();
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [rogueArticles, setRogueArticles] = useState<Article[]>([]);
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [models, setModels] = useState<AiModel[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingModels, setLoadingModels] = useState(true);
  const [progressCache, setProgressCache] = useState<{ userId: string | undefined, data: ProgressSummary | null }>({ userId: undefined, data: null });
  const progressSummary = progressCache.userId === user?.id ? progressCache.data : null;

  // Fetch Core Dashboard Data (Topics, Rogue Articles, Textbooks)
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const [tpData, rogueData, tbData] = await Promise.all([
          TopicService.getTopics(),
          ArticleService.getStandaloneArticles(),
          TextbookService.getTextbooks()
        ]);

        if (isMounted) {
          setTopics(tpData);
          setRogueArticles(rogueData);
          setTextbooks(tbData);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard core data:', error);
        if (isMounted) setError('Failed to fetch dashboard core data');
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
      ModelService.getModels()
        .then(data => {
          if (isMounted) {
            setModels(data);
            setLoadingModels(false);
          }
        })
        .catch(error => {
          console.error('Failed to fetch AI models:', error);
          if (isMounted) {
             setError('Failed to fetch AI models');
             setLoadingModels(false);
          }
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
        const data = await UserService.getUserProgressSummary();
        if (isMounted) setProgressCache({ userId: user.id, data });
      } catch (err) {
        console.error('Failed to fetch user progress:', err);
        if (isMounted) setError('Failed to fetch user progress summary');
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
    loadingModels,
    error
  };
}
