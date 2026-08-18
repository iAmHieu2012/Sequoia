import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || !user.app_metadata?.is_admin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const docId = body.id || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const now = new Date().toISOString();
    
    const { data: existing } = await supabaseAdmin.from('textbooks').select('created_at').eq('id', docId).single();
    
    const textbook = {
      id: docId,
      title: body.title,
      description: body.description,
      authors: body.authors || [],
      cover_image_url: body.cover_image_url,
      pdf_url: body.pdf_url,
      sort_order: body.sort_order,
      created_at: existing?.created_at ?? now,
      updated_at: now
    };

    const { error: insertError } = await supabaseAdmin.from('textbooks').upsert(textbook);
    if (insertError) throw insertError;
    
    return NextResponse.json({ data: textbook  });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err instanceof Error ? err.message : "Unknown error") }, { status: 500 });
  }
}
