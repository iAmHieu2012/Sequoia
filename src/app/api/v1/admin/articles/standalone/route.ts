import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .is('topic_id', null)
      .order('published_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
