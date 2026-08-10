import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = user.id;

    // 1. Get user progress
    let { data: progress } = await supabase
      .from('user_progress')
      .select('completed_article_ids')
      .eq('id', userId)
      .single();

    const completedSet = new Set(progress?.completed_article_ids || []);

    // 2. Get all published articles
    const { data: allArticles, error: articlesError } = await supabase
      .from('articles')
      .select('id, topic_id')
      .eq('is_published', true);

    if (articlesError) throw articlesError;

    // 3. Group by topic and calculate progress
    const topicProgress: Record<string, { total: number; completed: number }> = {};
    const standaloneStatus: Record<string, boolean> = {};

    for (const article of (allArticles || [])) {
      if (article.topic_id) {
        if (!topicProgress[article.topic_id]) {
          topicProgress[article.topic_id] = { total: 0, completed: 0 };
        }
        topicProgress[article.topic_id].total += 1;
        if (completedSet.has(article.id)) {
          topicProgress[article.topic_id].completed += 1;
        }
      } else {
        standaloneStatus[article.id] = completedSet.has(article.id);
      }
    }

    return NextResponse.json({
      data: {
        topics: topicProgress,
        standalone: standaloneStatus
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
