import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const supabase = await createClient();
    
    // 1. Fetch article metadata
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

    if (!article.is_published) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // 2. Fetch article content
    const { data: contentData, error: contentError } = await supabase
      .from('article_contents')
      .select('content')
      .eq('id', params.id)
      .single();

    if (contentError && contentError.code !== 'PGRST116') {
      throw contentError;
    }

    // Combine metadata and content
    const detail = {
      ...article,
      content: contentData?.content || ''
    };

    return NextResponse.json({ data: detail });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
