import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await request.json();
    const { bucket = 'uploads', path = `user_${user.id}/${Date.now()}` } = body;
    
    const { data, error: signError } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
    if (signError) throw signError;

    return NextResponse.json({ data: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
