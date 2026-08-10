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
    
    const { data: existing } = await supabaseAdmin.from('models').select('created_at').eq('id', docId).single();
    
    const model = {
      id: docId,
      name: body.name,
      description: body.description,
      task_type: body.task_type,
      file_url: body.file_url,
      metadata_url: body.metadata_url,
      version: body.version,
      format: body.format,
      file_size_bytes: body.file_size_bytes,
      created_at: existing?.created_at ?? now,
      updated_at: now
    };

    const { error: insertError } = await supabaseAdmin.from('models').upsert(model);
    if (insertError) throw insertError;
    
    return NextResponse.json({ data: model  });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
