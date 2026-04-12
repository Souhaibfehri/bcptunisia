import { NextResponse } from "next/server";
import { getPublicSiteOriginFromRequest } from "@/lib/publicSite";
import { routing } from "@/i18n/routing";

/**
 * Legacy `/auth/callback` (non-localized). Redirects to the default locale so existing
 * Supabase redirect URLs keep working while canonical URLs use `/[locale]/auth/callback`.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const base = getPublicSiteOriginFromRequest(request);
  const target = new URL(`${base}/${routing.defaultLocale}/auth/callback`);
  target.search = url.searchParams.toString();
  return NextResponse.redirect(target.toString(), 307);
}
