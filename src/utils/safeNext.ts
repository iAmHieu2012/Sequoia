/**
 * Where to send the user after signing in. Only same-site paths are allowed
 * ("/articles/abc"); anything else ("//evil.com", "https://...", ".evil.com") falls back to the dashboard.
 */
export function safeNext(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}
