import {
  getRecaptchaApiKey,
  getRecaptchaProjectId,
  getRecaptchaSiteKey,
} from "./config";

/** Forward browser headers so API keys restricted by HTTP referrer work from server-side fetch. */
export type RecaptchaAssessmentRequestContext = {
  referer?: string | null;
  userAgent?: string | null;
};

export function buildRecaptchaAssessmentHeaders(
  ctx?: RecaptchaAssessmentRequestContext,
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const ref = ctx?.referer?.trim();
  if (ref) headers.Referer = ref.slice(0, 2048);
  const ua = ctx?.userAgent?.trim();
  if (ua) headers["User-Agent"] = ua.slice(0, 512);
  return headers;
}

function trimEnv(key: string): string {
  return process.env[key]?.trim() ?? "";
}

/**
 * Site key sent in CreateAssessment must match the key embedded in the checkbox widget.
 * Prefer `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`; allow legacy `RECAPTCHA_SITE_KEY` when set alone.
 */
function siteKeyForCheckboxAssessment(): string {
  return getRecaptchaSiteKey() || trimEnv("RECAPTCHA_SITE_KEY");
}

export type RecaptchaCheckboxVerifyResult =
  | { ok: true }
  | { ok: false; reason: "missing_token" | "misconfigured" | "invalid" | "upstream" };

/**
 * Verifies a reCAPTCHA Enterprise **checkbox** token (server-only).
 * When there is no public site key, returns ok (no widget / local dev).
 * Does not log the token.
 */
export async function verifyEnterpriseCheckboxAssessment(
  token: string | null | undefined,
  requestContext?: RecaptchaAssessmentRequestContext,
): Promise<RecaptchaCheckboxVerifyResult> {
  const publicSiteKey = getRecaptchaSiteKey();
  if (!publicSiteKey) {
    return { ok: true };
  }

  const trimmed = (token ?? "").trim();
  if (!trimmed) {
    return { ok: false, reason: "missing_token" };
  }

  const projectId = getRecaptchaProjectId();
  const apiKey = getRecaptchaApiKey();
  const siteKey = siteKeyForCheckboxAssessment();
  if (!projectId || !apiKey || !siteKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[recaptcha] misconfigured: need RECAPTCHA_PROJECT_ID, RECAPTCHA_API_KEY (or RECAPTCHA_SECRET_KEY), site key",
      );
    }
    return { ok: false, reason: "misconfigured" };
  }

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
    if (process.env.NODE_ENV === "development") {
      console.warn("[recaptcha] network error", e instanceof Error ? e.message : "unknown");
    }
    return { ok: false, reason: "upstream" };
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    let errMsg = "";
    try {
      const j = JSON.parse(errText) as { error?: { message?: string } };
      errMsg = j.error?.message ?? "";
    } catch {
      errMsg = errText.slice(0, 200);
    }
    console.warn("[recaptcha] assessment HTTP", res.status, errMsg || "(no body)");
    return { ok: false, reason: "upstream" };
  }

  const data = (await res.json()) as {
    tokenProperties?: { valid?: boolean; invalidReason?: string };
  };

  const valid = data.tokenProperties?.valid === true;

  if (!valid) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[recaptcha] invalid token", data.tokenProperties?.invalidReason ?? "");
    }
    return { ok: false, reason: "invalid" };
  }

  return { ok: true };
}
