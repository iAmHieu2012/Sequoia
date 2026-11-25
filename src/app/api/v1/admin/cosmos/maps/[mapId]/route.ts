import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { supabaseService } from '@/utils/supabase/service';

export async function PUT(request: NextRequest, props: { params: Promise<{ mapId: string }> }) {
  const params = await props.params;
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const nodes = body.nodes || [];

    const { data, error: updateError } = await supabaseService.from('cosmos_maps').update({ nodes }).eq('id', params.mapId).select();
    if (updateError) throw updateError;
    
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
