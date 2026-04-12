import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseAppLocale } from "@/lib/appLocale";
import { getLocalizedPasswordRecoveryUrl } from "@/lib/serverPublicSite";
import { getSupabasePublicKey, getSupabaseUrl } from "@/utils/supabase/config";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? String((body as { email?: unknown }).email ?? "").trim()
      : "";

  const localeRaw =
    typeof body === "object" && body !== null && "locale" in body
      ? String((body as { locale?: unknown }).locale ?? "").trim()
      : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const url = getSupabaseUrl();
  const key = getSupabasePublicKey();
  if (!url || !key) {
    return NextResponse.json({ ok: false, error: "config" }, { status: 500 });
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const locale = parseAppLocale(localeRaw || null);
  const redirectTo = await getLocalizedPasswordRecoveryUrl(locale, { request });
  if (!redirectTo.startsWith("http")) {
    return NextResponse.json({ ok: false, error: "config" }, { status: 500 });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error && process.env.NODE_ENV === "development") {
    console.warn("[api/auth/forgot-password]", error.message);
  }

  return NextResponse.json({ ok: true });
}
