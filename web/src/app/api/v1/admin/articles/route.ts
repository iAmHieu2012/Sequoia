import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || !user.app_metadata?.is_admin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const docId = body.id || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const now = new Date().toISOString();
    
    // 1. Fetch old article to check if it's an update and if topic changed
    const { data: oldArticle } = await supabaseAdmin.from('articles').select('topic_id').eq('id', docId).single();
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
      created_at: oldArticle ? undefined : now,
      updated_at: now,
      published_at: oldArticle ? undefined : now
    };

    const { error: insertError } = await supabaseAdmin.from('articles').upsert(article);
    if (insertError) throw insertError;
    
    // Always insert content row even if empty
    const content = body.content || "";
    await supabaseAdmin.from('article_contents').upsert({ id: docId, content: content });

    // 2. Handle Topic article_count changes (Replacing old SQL Trigger)
    if (isNew && newTopicId) {
      const { data: topic } = await supabaseAdmin.from('topics').select('article_count').eq('id', newTopicId).single();
      if (topic) {
        await supabaseAdmin.from('topics').update({ article_count: (topic.article_count || 0) + 1 }).eq('id', newTopicId);
      }
    } else if (!isNew && oldTopicId !== newTopicId) {
      if (oldTopicId) {
        const { data: oldTopic } = await supabaseAdmin.from('topics').select('article_count').eq('id', oldTopicId).single();
        if (oldTopic) {
          await supabaseAdmin.from('topics').update({ article_count: Math.max(0, (oldTopic.article_count || 0) - 1) }).eq('id', oldTopicId);
        }
      }
      if (newTopicId) {
        const { data: newTopic } = await supabaseAdmin.from('topics').select('article_count').eq('id', newTopicId).single();
        if (newTopic) {
          await supabaseAdmin.from('topics').update({ article_count: (newTopic.article_count || 0) + 1 }).eq('id', newTopicId);
        }
      }
    }

    // 3. Handle Cosmos Map Node Sync (Replacing old SQL Trigger and incorporating UI coords)
    const newNodeData = {
      article_id: docId,
      title: body.title,
      celestial_type: body.celestial_type || (newTopicId ? 'star' : 'anomaly'),
      x: typeof body.x === 'number' ? body.x : 7500,
      y: typeof body.y === 'number' ? body.y : 2500,
      connections: Array.isArray(body.connections) ? body.connections : []
    };

    const newMapId = newTopicId || 'standalone-articles';
    const oldMapId = oldTopicId || 'standalone-articles';

    if (!isNew && oldMapId !== newMapId) {
      // Remove from old map
      const { data: oldMapData } = await supabaseAdmin.from('cosmos_maps').select('nodes').eq('id', oldMapId).single();
      if (oldMapData) {
        const updatedOldNodes = (oldMapData.nodes || []).filter((n: Record<string, unknown>) => n.article_id !== docId);
        await supabaseAdmin.from('cosmos_maps').update({ nodes: updatedOldNodes }).eq('id', oldMapId);
      }
    }

    // Add or Update in new map
    const { data: newMapData } = await supabaseAdmin.from('cosmos_maps').select('nodes').eq('id', newMapId).single();
    if (newMapData) {
      const nodes = newMapData.nodes || [];
      const existingIdx = nodes.findIndex((n: Record<string, unknown>) => n.article_id === docId);
      
      if (existingIdx !== -1) {
        nodes[existingIdx] = newNodeData; // Update existing coords/connections
      } else {
        nodes.push(newNodeData);
      }
      await supabaseAdmin.from('cosmos_maps').update({ nodes }).eq('id', newMapId);
    } else if (newMapId === 'standalone-articles') {
      await supabaseAdmin.from('cosmos_maps').insert({
        id: newMapId,
        map_type: 'rogue-anomalies',
        theme: 'nebula',
        nodes: [newNodeData]
      });
    }

    return NextResponse.json({ data: article });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err instanceof Error ? err.message : "Unknown error") }, { status: 500 });
  }
}
