import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || !user.app_metadata?.is_admin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const { error } = await supabaseAdmin.from('textbooks').delete().eq('id', params.id);
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err instanceof Error ? err.message : "Unknown error") }, { status: 500 });
  }
}
