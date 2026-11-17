import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/** Per-topic completed/total counts and per-article completion for standalone articles (published only). */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = user.id;

    const { data: progress } = await supabase
      .from('user_progress')
      .select('completed_article_ids')
      .eq('id', userId)
      .single();

    const completedSet = new Set(progress?.completed_article_ids || []);

    const { data: allArticles, error: articlesError } = await supabase
      .from('articles')
      .select('id, topic_id')
      .eq('is_published', true);

    if (articlesError) throw articlesError;

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
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
