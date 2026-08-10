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

    // Find all articles belonging to this topic before deletion
    const { data: topicArticles } = await supabaseAdmin
      .from('articles')
      .select('id, title')
      .eq('topic_id', params.id);

    // Delete the corresponding cosmos_map first to prevent Foreign Key constraint errors
    await supabaseAdmin.from('cosmos_maps').delete().eq('id', params.id);

    // Delete the topic (this cascades to set topic_id = NULL in articles)
    const { error } = await supabaseAdmin.from('topics').delete().eq('id', params.id);
    if (error) throw error;
    
    // If there were articles, migrate them to the standalone-articles map
    if (topicArticles && topicArticles.length > 0) {
      const mapId = 'standalone-articles';
      const { data: mapData } = await supabaseAdmin
        .from('cosmos_maps')
        .select('nodes')
        .eq('id', mapId)
        .single();
        
      if (mapData) {
        const currentNodes = Array.isArray(mapData.nodes) ? mapData.nodes : [];
        const newNodes = topicArticles.map((a: any) => ({
          article_id: a.id,
          title: a.title,
          celestial_type: 'anomaly',
          x: 7500 + Math.floor(Math.random() * 400 - 200), // Randomize slightly around center
          y: 2500 + Math.floor(Math.random() * 400 - 200),
          connections: []
        }));
        
        await supabaseAdmin
          .from('cosmos_maps')
          .update({ nodes: [...currentNodes, ...newNodes] })
          .eq('id', mapId);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
