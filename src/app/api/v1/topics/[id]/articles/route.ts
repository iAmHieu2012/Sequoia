import { NextRequest, NextResponse } from 'next/server';
import { supabasePublic } from '@/utils/supabase/public';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { data, error } = await supabasePublic
      .from('articles')
      .select('*')
      .eq('topic_id', params.id)
      .eq('is_published', true)
      .order('published_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
