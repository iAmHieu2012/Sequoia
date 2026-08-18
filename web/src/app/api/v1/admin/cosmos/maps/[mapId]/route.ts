import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function PUT(request: NextRequest, props: { params: Promise<{ mapId: string }> }) {
  const params = await props.params;
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || !user.app_metadata?.is_admin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const nodes = body.nodes || [];

    const { data, error: updateError } = await supabaseAdmin.from('cosmos_maps').update({ nodes }).eq('id', params.mapId).select();
    if (updateError) throw updateError;
    
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
