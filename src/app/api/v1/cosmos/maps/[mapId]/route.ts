import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest, props: { params: Promise<{ mapId: string }> }) {
  const params = await props.params;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cosmos_maps')
      .select('*')
      .eq('id', params.mapId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Cosmos Map not found' }, { status: 404 });
      throw error;
    }
    return NextResponse.json({ data: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
