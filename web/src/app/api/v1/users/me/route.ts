import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    return NextResponse.json({ data: user  });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err instanceof Error ? err.message : "Unknown error") }, { status: 500 });
  }
}
