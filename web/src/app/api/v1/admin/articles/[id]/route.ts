import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || !user.app_metadata?.is_admin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('articles')
      .select('*, article_contents(content)')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      throw error;
    }
    
    const articleDetail = {
      ...data,
      content: Array.isArray(data.article_contents) 
        ? data.article_contents[0]?.content || ''
        : data.article_contents?.content || ''
    };
    
    return NextResponse.json({ data: articleDetail  });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const docId = params.id;
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || !user.app_metadata?.is_admin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    // Fetch the article to know its topic_id before deleting
    const { data: article } = await supabaseAdmin.from('articles').select('topic_id').eq('id', docId).single();
    const topicId = article?.topic_id;

    const { error } = await supabaseAdmin.from('articles').delete().eq('id', docId);
    if (error) throw error;

    // Remove from cosmos_maps nodes (kept in API — requires JSONB array manipulation with UI data)
    const mapId = topicId || 'standalone-articles';
    const { data: mapData } = await supabaseAdmin.from('cosmos_maps').select('nodes').eq('id', mapId).single();
    if (mapData && mapData.nodes) {
      const updatedNodes = mapData.nodes
        .filter((n: Record<string, unknown>) => n.article_id !== docId)
        .map((n: Record<string, unknown>) => ({
          ...n,
          connections: Array.isArray(n.connections) ? n.connections.filter((id: string) => id !== docId) : []
        }));
      await supabaseAdmin.from('cosmos_maps').update({ nodes: updatedNodes }).eq('id', mapId);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
