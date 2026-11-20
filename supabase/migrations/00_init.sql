-- ==========================================================================
-- SEQUOIA DATABASE — Full Reset & Initialization (Firebase Auth)
-- ==========================================================================
--
-- WARNING: drops every Sequoia table, function, trigger and policy, then
--          recreates them. Export the data first (supabase/export) and load it
--          back with `npx tsx scripts/import_export.ts`.
--
-- Security model:
--   * Authentication is Firebase. Supabase never sees a user token, so every
--     request reaches Postgres either as `anon` (public reads) or as
--     `service_role` (the Next.js API, after it has verified the Firebase token).
--   * `anon` may only SELECT published content. It cannot read users or
--     progress, and cannot write anything.
--   * All writes go through the API with the service role key.
--
-- Sections:
--   0. Cleanup
--   1. Tables
--   2. Functions & Triggers
--   3. Permissions & Row Level Security
-- ==========================================================================


-- ==========================================================================
-- 0. CLEANUP
-- ==========================================================================

-- Left over from the Supabase Auth setup.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_topic_article_count() CASCADE;
DROP FUNCTION IF EXISTS public.sync_topic_to_cosmos_map() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_article_from_progress() CASCADE;

DROP TABLE IF EXISTS public.article_contents CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.cosmos_maps CASCADE;
DROP TABLE IF EXISTS public.models CASCADE;
DROP TABLE IF EXISTS public.textbooks CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.topics CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;


-- ==========================================================================
-- 1. TABLES
-- ==========================================================================

-- One row per Firebase user, created by POST /api/v1/users/me on sign-in.
CREATE TABLE public.users (
    id TEXT PRIMARY KEY,                      -- Firebase UID
    email TEXT,
    display_name TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.topics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    article_count INTEGER NOT NULL DEFAULT 0,  -- kept in sync by a trigger
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    topic_id TEXT REFERENCES public.topics(id) ON DELETE SET NULL,  -- NULL = standalone article
    summary TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ
);

CREATE INDEX articles_topic_id_idx ON public.articles (topic_id);

CREATE TABLE public.article_contents (
    id TEXT PRIMARY KEY REFERENCES public.articles(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT ''
);

CREATE TABLE public.textbooks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    authors TEXT[] NOT NULL DEFAULT '{}',
    cover_image_url TEXT,
    pdf_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    task_type TEXT,
    file_url TEXT,
    metadata_url TEXT,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    version TEXT NOT NULL DEFAULT '1.0',
    format TEXT NOT NULL DEFAULT 'litert',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One map per topic (same id) plus 'standalone-articles'. Nodes are stored inline:
-- [{ article_id, title, celestial_type, x, y, connections: [article_id] }]
CREATE TABLE public.cosmos_maps (
    id TEXT PRIMARY KEY,
    map_type TEXT NOT NULL,
    theme TEXT NOT NULL DEFAULT 'nebula',
    nodes JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ON UPDATE CASCADE: changing users.id (e.g. moving an account to a new UID) carries the progress along.
CREATE TABLE public.user_progress (
    id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    active_dates DATE[] NOT NULL DEFAULT '{}',
    completed_article_ids TEXT[] NOT NULL DEFAULT '{}',
    last_active TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ==========================================================================
-- 2. FUNCTIONS & TRIGGERS
-- ==========================================================================

-- updated_at = now() on every update.
CREATE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_textbooks_updated_at BEFORE UPDATE ON public.textbooks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_models_updated_at BEFORE UPDATE ON public.models FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- topics.article_count = number of articles in the topic.
CREATE FUNCTION public.update_topic_article_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.topic_id IS DISTINCT FROM NEW.topic_id) THEN
    IF OLD.topic_id IS NOT NULL THEN
      UPDATE topics SET article_count = (SELECT COUNT(*) FROM articles WHERE topic_id = OLD.topic_id)
      WHERE id = OLD.topic_id;
    END IF;
  END IF;

  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.topic_id IS DISTINCT FROM NEW.topic_id) THEN
    IF NEW.topic_id IS NOT NULL THEN
      UPDATE topics SET article_count = (SELECT COUNT(*) FROM articles WHERE topic_id = NEW.topic_id)
      WHERE id = NEW.topic_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_update_topic_article_count
  AFTER INSERT OR DELETE OR UPDATE OF topic_id ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_topic_article_count();

-- Every topic gets an empty map with the same id. Keeps an existing map (e.g. one being imported).
CREATE FUNCTION public.sync_topic_to_cosmos_map()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO cosmos_maps (id, map_type, theme, nodes)
  VALUES (NEW.id, 'topic', 'nebula', '[]'::jsonb)
  ON CONFLICT (id) DO NOTHING;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_sync_topic_to_cosmos_map
  AFTER INSERT ON public.topics
  FOR EACH ROW EXECUTE FUNCTION public.sync_topic_to_cosmos_map();

-- A deleted article disappears from everyone's completed list.
CREATE FUNCTION public.cleanup_article_from_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_progress
  SET completed_article_ids = array_remove(completed_article_ids, OLD.id)
  WHERE OLD.id = ANY(completed_article_ids);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_cleanup_article_from_progress
  AFTER DELETE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.cleanup_article_from_progress();


-- ==========================================================================
-- 3. PERMISSIONS & ROW LEVEL SECURITY
-- ==========================================================================

-- Start from nothing, then grant only what each role needs.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

GRANT SELECT ON public.topics, public.articles, public.article_contents,
                public.textbooks, public.models, public.cosmos_maps
  TO anon, authenticated;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cosmos_maps ENABLE ROW LEVEL SECURITY;

-- users and user_progress have no policies: only the service role can reach them.

CREATE POLICY "Public read topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Public read textbooks" ON public.textbooks FOR SELECT USING (true);
CREATE POLICY "Public read models" ON public.models FOR SELECT USING (true);
-- Map nodes may point to drafts; GET /api/v1/cosmos/maps/[mapId] filters those out.
CREATE POLICY "Public read cosmos_maps" ON public.cosmos_maps FOR SELECT USING (true);
CREATE POLICY "Public read published articles" ON public.articles FOR SELECT USING (is_published = true);
CREATE POLICY "Public read published article contents" ON public.article_contents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.articles a WHERE a.id = article_contents.id AND a.is_published = true)
);
