import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const docId = body.id || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

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
    };

    const { error: insertError } = await supabaseAdmin.from('models').upsert(model);
    if (insertError) throw insertError;
    
    return NextResponse.json({ data: model  });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
