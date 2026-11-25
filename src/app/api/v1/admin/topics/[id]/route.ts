import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { supabaseService } from '@/utils/supabase/service';

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    // Remember the topic's articles: after deletion they become standalone and need nodes on that map.
    const { data: topicArticles } = await supabaseService
      .from('articles')
      .select('id, title')
      .eq('topic_id', params.id);

    // The topic's map shares its id but has no foreign key to it, so it must be deleted explicitly.
    await supabaseService.from('cosmos_maps').delete().eq('id', params.id);

    // ON DELETE SET NULL turns the topic's articles into standalone articles.
    const { error } = await supabaseService.from('topics').delete().eq('id', params.id);
    if (error) throw error;
    
    // If there were articles, migrate them to the standalone-articles map
    if (topicArticles && topicArticles.length > 0) {
      const mapId = 'standalone-articles';
      const { data: mapData } = await supabaseService
        .from('cosmos_maps')
        .select('nodes')
        .eq('id', mapId)
        .single();
        
      if (mapData) {
        const currentNodes = Array.isArray(mapData.nodes) ? mapData.nodes : [];
        const newNodes = topicArticles.map((a: Record<string, unknown>) => ({
          article_id: a.id,
          title: a.title,
          celestial_type: 'anomaly',
          x: 0 + Math.floor(Math.random() * 400 - 200), // Randomize slightly around center
          y: 0 + Math.floor(Math.random() * 400 - 200),
          connections: []
        }));
        
        await supabaseService
          .from('cosmos_maps')
          .update({ nodes: [...currentNodes, ...newNodes] })
          .eq('id', mapId);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
