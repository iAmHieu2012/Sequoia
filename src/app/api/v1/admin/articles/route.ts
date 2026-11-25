import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { supabaseService } from '@/utils/supabase/service';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    // New articles get a slug of the title as their id.
    const docId = body.id || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const now = new Date().toISOString();
    
    // Fetch old article to check if it's an update and if topic changed (needed for cosmos map sync)
    const { data: oldArticle } = await supabaseService.from('articles').select('topic_id').eq('id', docId).single();
    const isNew = !oldArticle;
    const oldTopicId = oldArticle?.topic_id;
    const newTopicId = body.topic_id || null;

    const article = {
      id: docId,
      title: body.title,
      topic_id: newTopicId,
      summary: body.summary,
      tags: body.tags?.map((t: string) => t.trim()) || [],
      is_published: body.is_published ?? false,
      published_at: oldArticle ? undefined : now // set on first save only; undefined leaves it unchanged
    };

    const { error: insertError } = await supabaseService.from('articles').upsert(article);
    if (insertError) throw insertError;
    
    // Content lives in its own table; always write a row (even empty) so reads can join it.
    const content = body.content || "";
    await supabaseService.from('article_contents').upsert({ id: docId, content: content });

    // Keep the article's node in sync on the cosmos map of its topic (or the standalone map),
    // using the coordinates and connections set in the editor.
    const newNodeData = {
      article_id: docId,
      title: body.title,
      celestial_type: body.celestial_type || (newTopicId ? 'star' : 'anomaly'),
      x: typeof body.x === 'number' ? body.x : 0,
      y: typeof body.y === 'number' ? body.y : 0,
      connections: Array.isArray(body.connections) ? body.connections : []
    };

    const newMapId = newTopicId || 'standalone-articles';
    const oldMapId = oldTopicId || 'standalone-articles';

    if (!isNew && oldMapId !== newMapId) {
      // Remove from old map
      const { data: oldMapData } = await supabaseService.from('cosmos_maps').select('nodes').eq('id', oldMapId).single();
      if (oldMapData) {
        const updatedOldNodes = (oldMapData.nodes || []).filter((n: Record<string, unknown>) => n.article_id !== docId);
        await supabaseService.from('cosmos_maps').update({ nodes: updatedOldNodes }).eq('id', oldMapId);
      }
    }

    // Add or Update in new map
    const { data: newMapData } = await supabaseService.from('cosmos_maps').select('nodes').eq('id', newMapId).single();
    if (newMapData) {
      const nodes = newMapData.nodes || [];
      const existingIdx = nodes.findIndex((n: Record<string, unknown>) => n.article_id === docId);
      
      if (existingIdx !== -1) {
        nodes[existingIdx] = newNodeData; // Update existing coords/connections
      } else {
        nodes.push(newNodeData);
      }
      await supabaseService.from('cosmos_maps').update({ nodes }).eq('id', newMapId);
    } else if (newMapId === 'standalone-articles') {
      // Topic maps are created by a DB trigger; the standalone map is created on first use.
      await supabaseService.from('cosmos_maps').insert({
        id: newMapId,
        map_type: 'rogue-anomalies',
        theme: 'nebula',
        nodes: [newNodeData]
      });
    }

    // The article page is statically generated; refresh it so publish/unpublish takes effect.
    revalidatePath(`/articles/${docId}`);

    return NextResponse.json({ data: article });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
