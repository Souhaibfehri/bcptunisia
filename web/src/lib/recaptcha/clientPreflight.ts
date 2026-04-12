import { executeRecaptchaEnterprise } from "@/components/recaptcha/executeEnterprise";
import type { RecaptchaAction } from "@/lib/recaptcha/actions";

const FAIL = "Vérification de sécurité échouée. Réessayez.";

/**
 * When `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set, runs Enterprise execute + `/api/recaptcha/verify`.
 * When unset (local dev), succeeds without calling Google.
 */
export async function verifyRecaptchaPreflightOnClient(
  action: RecaptchaAction,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";
  if (!siteKey) return { ok: true };

  const token = await executeRecaptchaEnterprise(action);
  if (!token) return { ok: false, message: FAIL };

  const res = await fetch("/api/recaptcha/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, action }),
  });
  if (!res.ok) return { ok: false, message: FAIL };

  const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
  if (!json || json.ok !== true) return { ok: false, message: FAIL };

  return { ok: true };
}
