import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/server';
import { supabasePublic } from '@/utils/supabase/public';

interface MapNode {
  article_id: string;
  connections?: string[];
  [key: string]: unknown;
}

export async function GET(request: NextRequest, props: { params: Promise<{ mapId: string }> }) {
  const params = await props.params;
  try {
    const { data, error } = await supabasePublic
      .from('cosmos_maps')
      .select('*')
      .eq('id', params.mapId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Cosmos Map not found' }, { status: 404 });
      throw error;
    }

    // Hide draft articles from non-admins. Admins need every node, because the
    // Genesis map editor saves the full node list back and would drop drafts otherwise.
    const viewer = await getAuthUser(request);
    const nodes: MapNode[] = Array.isArray(data.nodes) ? data.nodes : [];

    if (!viewer?.isAdmin && nodes.length > 0) {
      // The anon client only sees published articles, so this returns exactly the visible ones.
      const { data: published, error: articlesError } = await supabasePublic
        .from('articles')
        .select('id')
        .in('id', nodes.map(n => n.article_id));
      if (articlesError) throw articlesError;

      const publishedIds = new Set((published ?? []).map(a => a.id));
      data.nodes = nodes
        .filter(n => publishedIds.has(n.article_id))
        .map(n => ({
          ...n,
          connections: (n.connections ?? []).filter(id => publishedIds.has(id)),
        }));
    }

    return NextResponse.json({ data: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
