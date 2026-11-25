import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { supabaseService } from '@/utils/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const docId = body.id || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const textbook = {
      id: docId,
      title: body.title,
      description: body.description,
      authors: body.authors || [],
      cover_image_url: body.cover_image_url,
      pdf_url: body.pdf_url,
      sort_order: body.sort_order,
    };

    const { error: insertError } = await supabaseService.from('textbooks').upsert(textbook);
    if (insertError) throw insertError;
    
    return NextResponse.json({ data: textbook  });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
