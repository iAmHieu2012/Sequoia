import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { supabaseService } from '@/utils/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const docId = body.id || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const topic = {
      id: docId,
      name: body.name,
      description: body.description,
      sort_order: body.sort_order,
    };

    const { error: insertError } = await supabaseService.from('topics').upsert(topic);
    if (insertError) throw insertError;
    
    return NextResponse.json({ data: topic  });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
