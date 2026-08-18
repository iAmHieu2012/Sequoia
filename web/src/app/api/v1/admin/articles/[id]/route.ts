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

    // Explicitly delete content first (matches Ktor and ensures no orphaned rows if missing CASCADE)
    await supabaseAdmin.from('article_contents').delete().eq('id', docId);

    const { error } = await supabaseAdmin.from('articles').delete().eq('id', docId);
    if (error) throw error;
    
    // Decrement topic article_count
    if (topicId) {
      const { data: topic } = await supabaseAdmin.from('topics').select('article_count').eq('id', topicId).single();
      if (topic) {
        await supabaseAdmin.from('topics').update({ article_count: Math.max(0, (topic.article_count || 0) - 1) }).eq('id', topicId);
      }
    }

    // Remove from cosmos_maps nodes
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
    
    // Clean up ghost IDs in user_progress
    const { data: usersProgress } = await supabaseAdmin
      .from('user_progress')
      .select('id, completed_article_ids')
      .contains('completed_article_ids', [docId]);

    if (usersProgress && usersProgress.length > 0) {
      for (const up of usersProgress) {
        const cleanedIds = (up.completed_article_ids || []).filter((id: string) => id !== docId);
        await supabaseAdmin
          .from('user_progress')
          .update({ completed_article_ids: cleanedIds })
          .eq('id', up.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
