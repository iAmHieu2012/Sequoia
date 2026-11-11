-- ==========================================================================
-- Fix: draft articles readable through the public anon key
-- ==========================================================================
-- Safe to run on an existing database: it only replaces one function and
-- one policy, and does not touch any data. Run on both dev and production.
-- ==========================================================================

-- is_admin(): the admin flag lives in app_metadata, not at the top level of the JWT.
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Article contents are readable only when the article is published (or by admins).
DROP POLICY IF EXISTS "Public read article contents" ON public.article_contents;
DROP POLICY IF EXISTS "Public read published article contents" ON public.article_contents;
CREATE POLICY "Public read published article contents" ON public.article_contents
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_contents.id AND a.is_published = true
    )
  );
