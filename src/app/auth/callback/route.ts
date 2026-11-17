import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { safeNext } from '@/utils/safeNext'

/**
 * OAuth (Google) and password-reset links land here with a one-time `code`.
 * On success: exchange it for a session and go to `next` (same-site paths only).
 * On failure: go back to the login page with an `error` code shown in the login panel.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'))

  // Behind a load balancer the public host is in X-Forwarded-Host.
  const forwardedHost = request.headers.get('x-forwarded-host')
  const base = process.env.NODE_ENV !== 'development' && forwardedHost ? `https://${forwardedHost}` : origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${base}${next}`)
  }

  // Provider error (e.g. the user pressed Cancel on Google's screen) or an invalid / expired code.
  const providerError = searchParams.get('error')
  const reason =
    next === '/auth/update-password' ? 'reset_link_invalid'
    : providerError === 'access_denied' ? 'oauth_cancelled'
    : 'oauth_failed'

  const loginUrl = new URL('/auth', base)
  loginUrl.searchParams.set('error', reason)
  if (next !== '/dashboard' && next !== '/auth/update-password') loginUrl.searchParams.set('next', next)
  return NextResponse.redirect(loginUrl)
}
