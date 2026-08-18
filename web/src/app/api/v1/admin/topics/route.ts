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
    const docId = body.id || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const now = new Date().toISOString();
    
    const { data: existing } = await supabaseAdmin.from('topics').select('article_count, created_at').eq('id', docId).single();
    
    const topic = {
      id: docId,
      name: body.name,
      description: body.description,
      sort_order: body.sort_order,
      article_count: existing?.article_count ?? 0,
      created_at: existing?.created_at ?? now
    };

    const { error: insertError } = await supabaseAdmin.from('topics').upsert(topic);
    if (insertError) throw insertError;
    
    // Auto-create cosmos_maps entry for this topic (Replacing old SQL Trigger)
    const { error: mapError } = await supabaseAdmin.from('cosmos_maps').upsert({
      id: docId,
      map_type: 'topic',
      theme: 'nebula',
      nodes: []
    }, { onConflict: 'id', ignoreDuplicates: true });
    if (mapError) throw mapError;
    
    return NextResponse.json({ data: topic  });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err instanceof Error ? err.message : "Unknown error") }, { status: 500 });
  }
}
