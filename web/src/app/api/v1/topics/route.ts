import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('sort_order');

    if (error) throw error;
    return NextResponse.json({ data: data });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err instanceof Error ? err.message : "Unknown error") }, { status: 500 });
  }
}
