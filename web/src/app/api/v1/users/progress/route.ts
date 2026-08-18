import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const localDate = request.nextUrl.searchParams.get('localDate');
    const userId = user.id;

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('id', userId)
      .single();

    let progress = data;

    if (error && error.code !== 'PGRST116') throw error;
    if (!progress) {
      progress = { id: userId, completed_article_ids: [], active_dates: [], current_streak: 0, longest_streak: 0 };
    }

    if (localDate) {
      const today = new Date(localDate);
      if (!isNaN(today.getTime())) {
        const activeDates = [...(progress.active_dates || [])];
        if (activeDates.length === 0 || activeDates[activeDates.length - 1] !== localDate) {
          let currentStreak = progress.current_streak || 0;
          let longestStreak = progress.longest_streak || 0;

          if (activeDates.length > 0) {
            const lastDate = new Date(activeDates[activeDates.length - 1]);
            if (!isNaN(lastDate.getTime())) {
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
          progress = updatedProgress;
        }
      }
    }

    return NextResponse.json({ data: progress  });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err instanceof Error ? err.message : "Unknown error") }, { status: 500 });
  }
}
