import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

/** Marks the article complete (or not, with `{ completed: false }`) for the signed-in user. */
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const auth = await requireUser(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const completed = body.completed !== undefined ? body.completed : true;
    const userId = auth.uid;
    const articleId = params.id;

    const { data, error } = await supabaseAdmin
      .from('user_progress')
      .select('*')
      .eq('id', userId)
      .single();

    let progress = data;

    // PGRST116 = no progress row yet: start from an empty one.
    if (error && error.code !== 'PGRST116') throw error;
    if (!progress) {
      progress = { id: userId, completed_article_ids: [], active_dates: [], current_streak: 0, longest_streak: 0 };
    }

    const currentCompleted = new Set<string>(progress.completed_article_ids || []);
    if (completed) currentCompleted.add(articleId);
    else currentCompleted.delete(articleId);

    const { error: updateError } = await supabaseAdmin
      .from('user_progress')
      .upsert({
        ...progress,
        id: userId,
        completed_article_ids: Array.from(currentCompleted)
      });

    if (updateError) throw updateError;
    
    return NextResponse.json({ data: { articleId, newStatus: completed } });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
