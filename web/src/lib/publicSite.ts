import { routing } from "@/i18n/routing";
import type { AppLocale } from "@/lib/appLocale";

const DEFAULT_DEV_ORIGIN = "http://localhost:3010";

function trimTrailingSlashes(s: string): string {
  return s.trim().replace(/\/+$/, "");
}

/**
 * Canonical public origin (no path, no trailing slash).
 * Prefer `NEXT_PUBLIC_APP_URL`, then `NEXT_PUBLIC_SITE_URL` (legacy).
 */
export function getPublicOriginFromEnv(): string | null {
  const a = trimTrailingSlashes(process.env.NEXT_PUBLIC_APP_URL ?? "");
  const b = trimTrailingSlashes(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  return a || b || null;
}

/** Local dev only — never use as production default when env is set. */
export function getDevelopmentFallbackOrigin(): string {
  return DEFAULT_DEV_ORIGIN;
}

function isBindHostname(hostname: string): boolean {
  return hostname === "0.0.0.0" || hostname === "[::]" || hostname === "::";
}

/**
 * Origin for redirects from a Request (Route Handlers): env first, then sane request / proxy headers.
 */
export function getPublicSiteOriginFromRequest(request: Request): string {
  const env = getPublicOriginFromEnv();
  if (env) return env;

  let fromRequest = "";
  try {
    fromRequest = new URL(request.url).origin;
  } catch {
    return process.env.NODE_ENV !== "production"
      ? getDevelopmentFallbackOrigin()
      : DEFAULT_DEV_ORIGIN;
  }

  try {
    const host = new URL(fromRequest).hostname;
    if (!isBindHostname(host) && host !== "") return fromRequest;
  } catch {
    /* fall through */
  }

  const xfHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const xfProto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  if (xfHost && !xfHost.includes("0.0.0.0")) {
    return `${xfProto}://${xfHost}`;
  }

  if (process.env.NODE_ENV !== "production") {
    return getDevelopmentFallbackOrigin();
  }

  return fromRequest;
}

/** Browser: env (build-time) first, else current origin. */
export function getPublicOriginForClient(): string {
  const env = getPublicOriginFromEnv();
  if (env) return env;
  if (typeof window !== "undefined") return window.location.origin;
  return getDevelopmentFallbackOrigin();
}

export function localePath(locale: AppLocale, pathWithoutLeadingSlash: string): string {
  const p = pathWithoutLeadingSlash.replace(/^\/+/, "");
  return `/${locale}/${p}`;
}

/** @deprecated use getPublicSiteOriginFromRequest */
export function getCallbackRedirectOrigin(request: Request): string {
  return getPublicSiteOriginFromRequest(request);
}

/** Reject open redirects for `next` after OAuth / email confirmation callback. */
export function getSafeNextPath(raw: string | null, fallback = "/portal/dashboard"): string {
  if (!raw) return fallback;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;
  if (t.includes("://")) return fallback;
  return t;
}

export function getLocalizedSignupEmailRedirectUrl(locale: AppLocale): string {
  const base = trimTrailingSlashes(getPublicOriginForClient());
  const next = getSafeNextPath("/portal/dashboard");
  return `${base}${localePath(locale, "auth/callback")}?next=${encodeURIComponent(next)}`;
}

export function getOAuthRedirectUrl(nextPath: string, locale: AppLocale): string {
  const base = trimTrailingSlashes(getPublicOriginForClient());
  const next = getSafeNextPath(nextPath);
  return `${base}${localePath(locale, "auth/callback")}?next=${encodeURIComponent(next)}`;
}

/** @deprecated */
export function getSiteBaseUrl(): string {
  return getPublicOriginFromEnv() ?? getDevelopmentFallbackOrigin();
}

/** @deprecated */
export function getSignupEmailRedirectUrl(): string {
  return getLocalizedSignupEmailRedirectUrl(routing.defaultLocale);
}
