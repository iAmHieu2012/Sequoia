import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client with the service role key: full database access, bypasses RLS.
 * Server only (Route Handlers, scripts), and only after the caller has been checked with
 * requireUser / requireAdmin (src/lib/auth/server.ts), because RLS will not stop anything here.
 * Public reads use supabasePublic instead. NEVER import this from a Client Component.
 */
export const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
