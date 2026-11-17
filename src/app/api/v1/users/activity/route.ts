import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Records a day as active for the signed-in user and updates the streak.
 * Body: `{ localDate: "YYYY-MM-DD" }` in the user's timezone. Returns the updated progress.
 * Only the first call of a day changes anything; repeat calls just return the progress.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => null);
    const localDate = typeof body?.localDate === 'string' ? body.localDate : '';
    const today = new Date(localDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate) || isNaN(today.getTime())) {
      return NextResponse.json({ error: 'localDate must be YYYY-MM-DD' }, { status: 400 });
    }

    const userId = user.id;
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('id', userId)
      .single();

    // PGRST116 = no progress row yet: start from an empty one.
    if (error && error.code !== 'PGRST116') throw error;
    const progress = data ?? { id: userId, completed_article_ids: [], active_dates: [], current_streak: 0, longest_streak: 0 };

    const activeDates: string[] = [...(progress.active_dates || [])];
    if (activeDates.length > 0 && activeDates[activeDates.length - 1] === localDate) {
      return NextResponse.json({ data: progress });
    }

    let currentStreak = progress.current_streak || 0;
    let longestStreak = progress.longest_streak || 0;

    if (activeDates.length > 0) {
      const lastDate = new Date(activeDates[activeDates.length - 1]);
      if (!isNaN(lastDate.getTime())) {
        // Both dates parse as UTC midnight, so this is a whole number of days.
        // 1 day apart continues the streak; a longer gap restarts it.
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak += 1;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) longestStreak = currentStreak;
    if (!activeDates.includes(localDate)) activeDates.push(localDate);

    const { data: updatedProgress, error: updateError } = await supabase
      .from('user_progress')
      .upsert({
        ...progress,
        id: userId,
        active_dates: activeDates,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_active: new Date().toISOString()
      })
      .select('*')
      .single();

    if (updateError) throw updateError;
    return NextResponse.json({ data: updatedProgress });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
