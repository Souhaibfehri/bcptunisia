import { NextResponse } from "next/server";
import { isRecaptchaAction } from "@/lib/recaptcha/actions";
import { isRecaptchaVerificationEnabled } from "@/lib/recaptcha/config";
import { verifyRecaptchaEnterprise } from "@/lib/recaptcha/verify";

/**
 * Pre-flight verification for client-only Supabase flows (email/password login & signup).
 */
export async function POST(req: Request) {
  let body: { token?: unknown; action?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const actionRaw = typeof body.action === "string" ? body.action : "";
  if (!isRecaptchaAction(actionRaw)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!isRecaptchaVerificationEnabled()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const result = await verifyRecaptchaEnterprise(token, actionRaw, {
    referer: req.headers.get("referer"),
    userAgent: req.headers.get("user-agent"),
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
