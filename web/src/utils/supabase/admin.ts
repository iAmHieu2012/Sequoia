import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client setup.
 * WARNING: This client bypasses RLS (Row Level Security).
 * ONLY USE in Server Actions or Route Handlers for Admin-level tasks.
 * NEVER export or import this file in Client Components.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
