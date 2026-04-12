import type { RecaptchaAction } from "./actions";

const FAIL = "Vérification de sécurité échouée. Réessayez.";

/**
 * Client-side pre-check for portal login/signup: POST token to `/api/recaptcha/verify`.
 */
export async function verifyPortalRecaptchaPreflight(
  token: string,
  action: RecaptchaAction,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";
  if (!siteKey) return { ok: true };

  const t = token.trim();
  if (!t) return { ok: false, message: FAIL };

  const res = await fetch("/api/recaptcha/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: t, action }),
  });

  let payload: { ok?: boolean; skipped?: boolean } | null = null;
  try {
    payload = (await res.json()) as { ok?: boolean; skipped?: boolean };
  } catch {
    payload = null;
  }

  if (res.ok && (payload?.skipped === true || payload?.ok === true)) {
    return { ok: true };
  }
  return { ok: false, message: FAIL };
}
