import { NextResponse } from "next/server";
import { getCallbackRedirectOrigin, getSafeNextPath } from "@/lib/siteUrl";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeNextPath(searchParams.get("next"));
  const base = getCallbackRedirectOrigin(request);

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
