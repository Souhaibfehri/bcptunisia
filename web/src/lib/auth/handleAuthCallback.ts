import { NextResponse } from "next/server";
import { getPublicSiteOriginFromRequest, getSafeNextPath } from "@/lib/publicSite";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function handleAuthCallbackGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = getSafeNextPath(url.searchParams.get("next"));
  const base = getPublicSiteOriginFromRequest(request);

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      try {
        await supabase.rpc("ensure_my_profile");
      } catch {
        // RPC may not exist yet; profile will be backfilled on next login
      }
      return NextResponse.redirect(`${base}${next}`);
    }

    if (process.env.NODE_ENV === "development") {
      console.warn("[auth/callback] exchangeCodeForSession:", error.message);
    }
  }

  return NextResponse.redirect(
    `${base}/portal/login?error=${encodeURIComponent("Échec de l'authentification. Veuillez réessayer.")}`,
  );
}
