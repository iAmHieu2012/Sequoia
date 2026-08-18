import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .is('topic_id', null)
      .eq('is_published', true);

    if (error) throw error;
    return NextResponse.json({ data: data });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err instanceof Error ? err.message : "Unknown error") }, { status: 500 });
  }
}
