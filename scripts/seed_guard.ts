/**
 * Refuses to run destructive seed scripts against any database except a known dev one.
 *
 * Allowed when NEXT_PUBLIC_SUPABASE_URL is:
 *   - a local Supabase (localhost / 127.0.0.1), or
 *   - exactly equal to SEED_ALLOWED_SUPABASE_URL set in .env.local (your dev project URL).
 */
export function assertDevDatabase(supabaseUrl: string | undefined) {
  if (!supabaseUrl) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
    process.exit(1);
  }

  const host = new URL(supabaseUrl).hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const allowed = process.env.SEED_ALLOWED_SUPABASE_URL;
  const isAllowedDev = !!allowed && allowed.replace(/\/$/, '') === supabaseUrl.replace(/\/$/, '');

  if (!isLocal && !isAllowedDev) {
    console.error(
      `\n⛔ Refusing to seed: ${host} is not a known dev database.\n` +
      `Seed scripts DELETE all users and content.\n` +
      `If this really is your dev project, add to .env.local:\n` +
      `  SEED_ALLOWED_SUPABASE_URL=${supabaseUrl}\n`
    );
    process.exit(1);
  }
}
