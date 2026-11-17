import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Returns the signed-in user's progress (read-only).
 * Recording a visit and updating the streak is POST /api/v1/users/activity.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('id', user.id)
      .single();

    // PGRST116 = no progress row yet: report empty progress.
    if (error && error.code !== 'PGRST116') throw error;
    const progress = data ?? { id: user.id, completed_article_ids: [], active_dates: [], current_streak: 0, longest_streak: 0 };

    return NextResponse.json({ data: progress });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
