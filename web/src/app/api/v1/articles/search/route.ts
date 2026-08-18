import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q')?.trim();
    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters long' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .or(`title.ilike.%${query}%,tags.cs.{${JSON.stringify(query)}}`);

    if (error) throw error;
    return NextResponse.json({ data: data });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err instanceof Error ? err.message : "Unknown error") }, { status: 500 });
  }
}
