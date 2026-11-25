import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { supabaseService } from '@/utils/supabase/service';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { data, error } = await supabaseService
      .from('articles')
      .select('*')
      .eq('topic_id', params.id)
      .order('published_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
