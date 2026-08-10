-- =====================================================================================
-- FULL RESET & INITIALIZATION SCRIPT FOR SEQUOIA SUPABASE
-- Description: Wipes all existing tables and recreates them mirroring the NoSQL structure EXACTLY.
-- =====================================================================================

-- ==========================================
-- 0. DANGER ZONE: DROP EXISTING TABLES
-- ==========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS update_topic_article_count() CASCADE;
DROP FUNCTION IF EXISTS sync_topic_to_cosmos_map() CASCADE;
DROP FUNCTION IF EXISTS sync_article_topic_to_cosmos_node() CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

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

-- ==========================================
-- 1. TABLE CREATION
-- ==========================================

-- 1. Users Table
CREATE TABLE public.users (
    id TEXT PRIMARY KEY,
    uid TEXT UNIQUE NOT NULL,
    email TEXT,
    display_name TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Topics Table
CREATE TABLE public.topics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    article_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Articles Table
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

-- 3.5. Article Contents Table
CREATE TABLE public.article_contents (
    id TEXT PRIMARY KEY REFERENCES public.articles(id) ON DELETE CASCADE,
    content TEXT NOT NULL
);

-- 4. Textbooks Table
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

-- 5. Models Table
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

-- 6. Cosmos Maps Table
CREATE TABLE public.cosmos_maps (
    id TEXT PRIMARY KEY,
    map_type TEXT NOT NULL,
    theme TEXT DEFAULT 'nebula',
    nodes JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. User Progress Table
CREATE TABLE public.user_progress (
    id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    active_dates DATE[] DEFAULT '{}',
    completed_article_ids TEXT[] DEFAULT '{}',
    last_active TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 2. TRIGGERS & FUNCTIONS
-- ==========================================

-- Auto-update `updated_at` column
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

-- Auto-create users on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, uid, email, display_name, photo_url)
  VALUES (
    new.id, 
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_progress (id)
  VALUES (new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 3. PERMISSIONS AND RLS
-- ==========================================

-- Ensure API permissions are granted!
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Enable RLS
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

-- Users / Progress
CREATE POLICY "Users can access own profile" ON public.users FOR ALL USING (auth.uid()::text = id OR is_admin());
CREATE POLICY "Users can access own progress" ON public.user_progress FOR ALL USING (auth.uid()::text = id OR is_admin());

-- General Data
CREATE POLICY "Public read topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Admin write topics" ON public.topics FOR ALL USING (is_admin());

CREATE POLICY "Public read textbooks" ON public.textbooks FOR SELECT USING (true);
CREATE POLICY "Admin write textbooks" ON public.textbooks FOR ALL USING (is_admin());

CREATE POLICY "Public read models" ON public.models FOR SELECT USING (true);
CREATE POLICY "Admin write models" ON public.models FOR ALL USING (is_admin());

CREATE POLICY "Public read cosmos_maps" ON public.cosmos_maps FOR SELECT USING (true);
CREATE POLICY "Admin write cosmos_maps" ON public.cosmos_maps FOR ALL USING (is_admin());

-- Articles
CREATE POLICY "Public read published articles" ON public.articles FOR SELECT USING (is_published = true OR is_admin());
CREATE POLICY "Admin write articles" ON public.articles FOR ALL USING (is_admin());
CREATE POLICY "Public read article contents" ON public.article_contents FOR SELECT USING (true);
CREATE POLICY "Admin write article contents" ON public.article_contents FOR ALL USING (is_admin());
