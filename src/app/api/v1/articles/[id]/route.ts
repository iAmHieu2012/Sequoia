import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const supabase = await createClient();
    
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', params.id)
      .single();

    if (articleError) {
      if (articleError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      throw articleError;
    }

    // Drafts look missing here, even to admins (they use /api/v1/admin/articles/[id]).
    if (!article.is_published) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const { data: contentData, error: contentError } = await supabase
      .from('article_contents')
      .select('content')
      .eq('id', params.id)
      .single();

    // PGRST116 = no row: treat a missing content row as empty content.
    if (contentError && contentError.code !== 'PGRST116') {
      throw contentError;
    }

    const detail = {
      ...article,
      content: contentData?.content || ''
    };

    return NextResponse.json({ data: detail });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
