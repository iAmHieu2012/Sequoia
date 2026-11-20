import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

/**
 * Returns the signed-in user's progress (read-only).
 * Recording a visit and updating the streak is POST /api/v1/users/activity.
 */
export async function GET(request: Request) {
  try {
    const auth = await requireUser(request);
    if (auth instanceof NextResponse) return auth;

    const { data, error } = await supabaseAdmin
      .from('user_progress')
      .select('*')
      .eq('id', auth.uid)
      .single();

    // PGRST116 = no progress row yet: report empty progress.
    if (error && error.code !== 'PGRST116') throw error;
    const progress = data ?? { id: auth.uid, completed_article_ids: [], active_dates: [], current_streak: 0, longest_streak: 0 };

    return NextResponse.json({ data: progress });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
