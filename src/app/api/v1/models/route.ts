import { NextResponse } from 'next/server';
import { supabasePublic } from '@/utils/supabase/public';

export async function GET() {
  try {
    const { data, error } = await supabasePublic.from('models').select('*');
    if (error) throw error;
    return NextResponse.json({ data: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
