import {
  getRecaptchaApiKey,
  getRecaptchaProjectId,
  getRecaptchaSiteKey,
} from "@/lib/recaptcha/config";
import {
  buildRecaptchaAssessmentHeaders,
  type RecaptchaAssessmentRequestContext,
} from "@/lib/recaptcha/verify";

function trimEnv(key: string): string {
  return process.env[key]?.trim() ?? "";
}

/**
 * Must match the key embedded in the browser widget (NEXT_PUBLIC_*).
 * Prefer public key over RECAPTCHA_SITE_KEY so a mis-set server-only key never breaks verification.
 */
function siteKeyForPublicLeadAssessment(): string {
  return getRecaptchaSiteKey() || trimEnv("RECAPTCHA_SITE_KEY");
}

function contactRecaptchaServerReady(): boolean {
  return !!(getRecaptchaProjectId() && getRecaptchaApiKey() && siteKeyForPublicLeadAssessment());
}

/**
 * Public lead form: Enterprise REST CreateAssessment (checkbox tokens).
 * Uses same API key / project / header forwarding as `verifyRecaptchaEnterprise` (login, signup, etc.).
 */
export async function verifyPublicLeadRecaptchaCheckboxToken(
  token: string | null | undefined,
  requestContext?: RecaptchaAssessmentRequestContext,
): Promise<{ ok: true } | { ok: false; reason: "missing" | "invalid" | "upstream" | "misconfigured" }> {
  const publicKey = getRecaptchaSiteKey();
  if (!publicKey) {
    return { ok: true };
  }

  const trimmed = (token ?? "").trim();
  if (!trimmed) {
    return { ok: false, reason: "missing" };
  }

  if (!contactRecaptchaServerReady()) {
    console.warn(
      "[recaptcha/contact] misconfigured: need RECAPTCHA_PROJECT_ID, RECAPTCHA_API_KEY (or RECAPTCHA_SECRET_KEY), NEXT_PUBLIC_RECAPTCHA_SITE_KEY",
    );
    return { ok: false, reason: "misconfigured" };
  }

  const projectId = getRecaptchaProjectId();
  const apiKey = getRecaptchaApiKey();
  const siteKey = siteKeyForPublicLeadAssessment();
  const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/assessments?key=${encodeURIComponent(apiKey)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: buildRecaptchaAssessmentHeaders(requestContext),
      body: JSON.stringify({
        event: {
          token: trimmed,
          siteKey,
        },
      }),
      cache: "no-store",
    });
  } catch (e) {
    console.warn("[recaptcha/contact] network", e instanceof Error ? e.message : "unknown");
    return { ok: false, reason: "upstream" };
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    let errMsg = "";
    try {
      const j = JSON.parse(errText) as { error?: { message?: string; status?: string } };
      errMsg = j.error?.message ?? "";
    } catch {
      errMsg = errText.slice(0, 200);
    }
    console.warn("[recaptcha/contact] assessment HTTP", res.status, errMsg || "(no body)");
    return { ok: false, reason: "upstream" };
  }

  const data = (await res.json()) as {
    tokenProperties?: { valid?: boolean; invalidReason?: string };
  };

  const valid = data.tokenProperties?.valid === true;

  if (!valid) {
    console.warn(
      "[recaptcha/contact] token invalid",
      data.tokenProperties?.invalidReason ?? "unknown",
    );
    return { ok: false, reason: "invalid" };
  }

  return { ok: true };
}
