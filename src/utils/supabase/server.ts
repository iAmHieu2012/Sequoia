import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase Client setup using @supabase/ssr.
 * Must be used in Server Components, Route Handlers, or Server Actions.
 * Handles reading/writing auth cookies automatically.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component, where cookies are read-only. Safe to ignore:
            // there is no proxy refreshing sessions here, so token refresh happens in the
            // browser client and in Route Handlers, which can write cookies.
          }
        },
      },
    }
  )
}
