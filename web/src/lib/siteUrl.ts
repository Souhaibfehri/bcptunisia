const DEFAULT_DEV_SITE_URL = "http://localhost:3010";

function trimBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

function isBindOrLoopbackOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname === "0.0.0.0" || hostname === "[::]" || hostname === "::";
  } catch {
    return true;
  }
}

/**
 * Public origin for server-side redirects after `/auth/callback` (avoid `0.0.0.0:3000` behind reverse proxies).
 *
 * 1) `NEXT_PUBLIC_SITE_URL` when set (recommended in production).
 * 2) Else `Origin` from the request URL if it is not a bind address.
 * 3) Else `X-Forwarded-Host` + `X-Forwarded-Proto` (typical behind Hostinger / nginx).
 * 4) Else dev default `http://localhost:3010`.
 */
export function getCallbackRedirectOrigin(request: Request): string {
  const configured = trimBaseUrl(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  if (configured) return configured;

  let fromRequest: string;
  try {
    fromRequest = new URL(request.url).origin;
  } catch {
    return DEFAULT_DEV_SITE_URL;
  }

  if (!isBindOrLoopbackOrigin(fromRequest)) return fromRequest;

  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  if (host && !host.includes("0.0.0.0")) {
    return `${proto}://${host}`;
  }

  return DEFAULT_DEV_SITE_URL;
}

/** Reject open redirects; only same-origin paths allowed for `next` after auth callback. */
export function getSafeNextPath(raw: string | null, fallback = "/portal/dashboard"): string {
  if (!raw) return fallback;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;
  if (t.includes("://")) return fallback;
  return t;
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

/**
 * Full URL passed to `resetPasswordForEmail` → `redirectTo` (password recovery).
 *
 * Must be a page route (not `/auth/callback`): Supabase often returns tokens in the URL
 * **hash**, which never reaches the server — `/portal/reset-password` handles them on the client.
 */
export function getPasswordRecoveryRedirectUrl(): string {
  const base = getSiteBaseUrl();
  return `${base}/portal/reset-password`;
}

/** Full URL for OAuth `signInWithOAuth` callback; `next` is a path (e.g. `/portal/dashboard`). */
export function getOAuthRedirectUrl(nextPath: string): string {
  const base = getSiteBaseUrl();
  const path = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${base}/auth/callback?next=${encodeURIComponent(path)}`;
}
