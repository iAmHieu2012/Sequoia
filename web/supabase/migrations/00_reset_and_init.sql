-- ==========================================================================
-- SEQUOIA DATABASE — Full Reset & Initialization
-- ==========================================================================
--
-- WARNING: Running this script will DROP all existing tables, functions,
--          triggers, and policies, then recreate them from scratch.
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

-- Drop triggers & functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_topic_article_count() CASCADE;
DROP FUNCTION IF EXISTS sync_topic_to_cosmos_map() CASCADE;
DROP FUNCTION IF EXISTS sync_article_topic_to_cosmos_node() CASCADE;
DROP FUNCTION IF EXISTS cleanup_article_from_progress() CASCADE;

-- Drop tables (order matters due to FK constraints)
DROP TABLE IF EXISTS public.article_contents CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.cosmos_nodes CASCADE;
DROP TABLE IF EXISTS public.cosmos_maps CASCADE;
DROP TABLE IF EXISTS public.models CASCADE;
DROP TABLE IF EXISTS public.ai_models CASCADE;
DROP TABLE IF EXISTS public.textbooks CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.topics CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.user_completed_articles CASCADE;


-- ==========================================================================
-- 1. TABLES
-- ==========================================================================

CREATE TABLE public.users (
    id TEXT PRIMARY KEY,
    uid TEXT UNIQUE NOT NULL,
    email TEXT,
    display_name TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.topics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    article_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    topic_id TEXT REFERENCES public.topics(id) ON DELETE SET NULL,
    summary TEXT,
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    published_at TIMESTAMPTZ
);

CREATE TABLE public.article_contents (
    id TEXT PRIMARY KEY REFERENCES public.articles(id) ON DELETE CASCADE,
    content TEXT NOT NULL
);

CREATE TABLE public.textbooks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    authors TEXT[] DEFAULT '{}',
    cover_image_url TEXT,
    pdf_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    task_type TEXT,
    file_url TEXT,
    metadata_url TEXT,
    file_size_bytes BIGINT DEFAULT 0,
    version TEXT DEFAULT '1.0',
    format TEXT DEFAULT 'litert',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.cosmos_maps (
    id TEXT PRIMARY KEY,
    map_type TEXT NOT NULL,
    theme TEXT DEFAULT 'nebula',
    nodes JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_progress (
    id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    active_dates DATE[] DEFAULT '{}',
    completed_article_ids TEXT[] DEFAULT '{}',
    last_active TIMESTAMPTZ DEFAULT now()
);


-- ==========================================================================
-- 2. FUNCTIONS & TRIGGERS
-- ==========================================================================

-- [Utility] Auto-set updated_at = now() on row update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_textbooks_updated_at BEFORE UPDATE ON public.textbooks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_models_updated_at BEFORE UPDATE ON public.models FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- [Auth] Auto-create public.users + user_progress row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, uid, email, display_name, photo_url)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_progress (id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- [Data Integrity] Sync topics.article_count via COUNT(*)
CREATE OR REPLACE FUNCTION update_topic_article_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.topic_id IS DISTINCT FROM NEW.topic_id) THEN
    IF OLD.topic_id IS NOT NULL THEN
      UPDATE topics SET article_count = (
        SELECT COUNT(*) FROM articles WHERE topic_id = OLD.topic_id
      ) WHERE id = OLD.topic_id;
    END IF;
  END IF;

  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.topic_id IS DISTINCT FROM NEW.topic_id) THEN
    IF NEW.topic_id IS NOT NULL THEN
      UPDATE topics SET article_count = (
        SELECT COUNT(*) FROM articles WHERE topic_id = NEW.topic_id
      ) WHERE id = NEW.topic_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_topic_article_count
  AFTER INSERT OR DELETE OR UPDATE OF topic_id ON public.articles
  FOR EACH ROW EXECUTE FUNCTION update_topic_article_count();

-- [Data Integrity] Auto-create cosmos_maps entry for new topics
CREATE OR REPLACE FUNCTION sync_topic_to_cosmos_map()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO cosmos_maps (id, map_type, theme, nodes)
  VALUES (NEW.id, 'topic', 'nebula', '[]'::jsonb)
  ON CONFLICT (id) DO NOTHING;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_sync_topic_to_cosmos_map
  AFTER INSERT ON public.topics
  FOR EACH ROW EXECUTE FUNCTION sync_topic_to_cosmos_map();

-- [Data Integrity] Remove deleted article IDs from user_progress
CREATE OR REPLACE FUNCTION cleanup_article_from_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_progress
  SET completed_article_ids = array_remove(completed_article_ids, OLD.id)
  WHERE OLD.id = ANY(completed_article_ids);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_cleanup_article_from_progress
  AFTER DELETE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION cleanup_article_from_progress();


-- ==========================================================================
-- 3. PERMISSIONS & ROW LEVEL SECURITY
-- ==========================================================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cosmos_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'is_admin')::boolean = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users & Progress: own data only, or admin
CREATE POLICY "Users can access own profile" ON public.users FOR ALL USING (auth.uid()::text = id OR is_admin());
CREATE POLICY "Users can access own progress" ON public.user_progress FOR ALL USING (auth.uid()::text = id OR is_admin());

-- Topics: public read, admin write
CREATE POLICY "Public read topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Admin write topics" ON public.topics FOR ALL USING (is_admin());

-- Textbooks: public read, admin write
CREATE POLICY "Public read textbooks" ON public.textbooks FOR SELECT USING (true);
CREATE POLICY "Admin write textbooks" ON public.textbooks FOR ALL USING (is_admin());

-- Models: public read, admin write
CREATE POLICY "Public read models" ON public.models FOR SELECT USING (true);
CREATE POLICY "Admin write models" ON public.models FOR ALL USING (is_admin());

-- Cosmos Maps: public read, admin write
CREATE POLICY "Public read cosmos_maps" ON public.cosmos_maps FOR SELECT USING (true);
CREATE POLICY "Admin write cosmos_maps" ON public.cosmos_maps FOR ALL USING (is_admin());

-- Articles & Contents: public read published (or admin), admin write
CREATE POLICY "Public read published articles" ON public.articles FOR SELECT USING (is_published = true OR is_admin());
CREATE POLICY "Admin write articles" ON public.articles FOR ALL USING (is_admin());
CREATE POLICY "Public read article contents" ON public.article_contents FOR SELECT USING (true);
CREATE POLICY "Admin write article contents" ON public.article_contents FOR ALL USING (is_admin());
