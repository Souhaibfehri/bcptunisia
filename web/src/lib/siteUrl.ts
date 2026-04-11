const DEFAULT_DEV_SITE_URL = "http://localhost:3010";

function trimBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

/**
 * Public site origin (no trailing slash) for Supabase `redirectTo` / `emailRedirectTo`.
 *
 * - Set `NEXT_PUBLIC_SITE_URL` for staging/production (e.g. `https://preview.example.com`).
 * - If unset, local dev defaults to `http://localhost:3010` (see `package.json` dev port).
 */
export function getSiteBaseUrl(): string {
  const fromEnv = trimBaseUrl(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  if (fromEnv) return fromEnv;
  return DEFAULT_DEV_SITE_URL;
}

/** Full URL passed to `signUp` → `emailRedirectTo` (email confirmation). */
export function getSignupEmailRedirectUrl(): string {
  const base = getSiteBaseUrl();
  return `${base}/auth/callback?next=${encodeURIComponent("/portal/dashboard")}`;
}

/** Full URL passed to `resetPasswordForEmail` → `redirectTo` (password recovery). */
export function getPasswordRecoveryRedirectUrl(): string {
  const base = getSiteBaseUrl();
  return `${base}/auth/callback?next=${encodeURIComponent("/portal/reset-password")}`;
}

/** Full URL for OAuth `signInWithOAuth` callback; `next` is a path (e.g. `/portal/dashboard`). */
export function getOAuthRedirectUrl(nextPath: string): string {
  const base = getSiteBaseUrl();
  const path = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${base}/auth/callback?next=${encodeURIComponent(path)}`;
}
