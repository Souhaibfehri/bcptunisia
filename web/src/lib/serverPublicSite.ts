import { headers } from "next/headers";
import type { AppLocale } from "@/lib/appLocale";
import {
  getDevelopmentFallbackOrigin,
  getPublicOriginFromEnv,
  getPublicSiteOriginFromRequest,
  getSafeNextPath,
  localePath,
} from "@/lib/publicSite";
import { routing } from "@/i18n/routing";

function trimTrailingSlashes(s: string): string {
  return s.trim().replace(/\/+$/, "");
}

export async function getPublicSiteOriginForServerActions(): Promise<string> {
  const env = getPublicOriginFromEnv();
  if (env) return env;

  const h = await headers();
  const xfHost = h.get("x-forwarded-host")?.split(",")[0]?.trim();
  const xfProto = (h.get("x-forwarded-proto") ?? "https").split(",")[0]?.trim();
  if (xfHost && !xfHost.includes("0.0.0.0")) {
    return `${xfProto}://${xfHost}`;
  }

  const host = h.get("host");
  if (host && !host.includes("0.0.0.0")) {
    const proto = process.env.NODE_ENV === "production" ? "https" : "http";
    return `${proto}://${host}`;
  }

  if (process.env.NODE_ENV !== "production") {
    return getDevelopmentFallbackOrigin();
  }

  return "";
}

async function resolveServerBase(opts?: { request?: Request; origin?: string }): Promise<string> {
  if (opts?.origin) return trimTrailingSlashes(opts.origin);
  if (opts?.request) return trimTrailingSlashes(getPublicSiteOriginFromRequest(opts.request));
  const fromCtx = trimTrailingSlashes(await getPublicSiteOriginForServerActions());
  if (fromCtx) return fromCtx;
  if (process.env.NODE_ENV !== "production") return getDevelopmentFallbackOrigin();
  return "";
}

export async function getLocalizedAuthCallbackUrl(
  locale: AppLocale,
  nextPath: string,
  opts?: { request?: Request; origin?: string },
): Promise<string> {
  const base = await resolveServerBase(opts);
  const next = getSafeNextPath(nextPath);
  return `${base}${localePath(locale, "auth/callback")}?next=${encodeURIComponent(next)}`;
}

export async function getLocalizedPasswordRecoveryUrl(
  locale: AppLocale,
  opts?: { request?: Request; origin?: string },
): Promise<string> {
  const base = await resolveServerBase(opts);
  return `${base}${localePath(locale, "portal/reset-password")}`;
}

/** @deprecated */
export async function getPasswordRecoveryRedirectUrl(): Promise<string> {
  return getLocalizedPasswordRecoveryUrl(routing.defaultLocale);
}
