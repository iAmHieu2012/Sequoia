import { createClient } from '@supabase/supabase-js'

/**
 * Anon Supabase client for public reads (server or browser). It never carries a user session:
 * RLS limits it to published content, and it cannot read users or progress or write anything.
 */
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)
