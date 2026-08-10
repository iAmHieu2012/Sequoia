import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const completed = body.completed !== undefined ? body.completed : true;
    const userId = user.id;
    const articleId = params.id;

    let { data: progress, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!progress) {
      progress = { id: userId, completed_article_ids: [], active_dates: [], current_streak: 0, longest_streak: 0 };
    }

    let currentCompleted = new Set<string>(progress.completed_article_ids || []);
    if (completed) currentCompleted.add(articleId);
    else currentCompleted.delete(articleId);

    const { error: updateError } = await supabase
      .from('user_progress')
      .upsert({
        ...progress,
        id: userId,
        completed_article_ids: Array.from(currentCompleted)
      });

    if (updateError) throw updateError;
    
    return NextResponse.json({ data: { articleId, newStatus: completed } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
