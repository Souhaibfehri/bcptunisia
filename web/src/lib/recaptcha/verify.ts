import type { RecaptchaAction } from "./actions";
import {
  getMinScore,
  getRecaptchaApiKey,
  getRecaptchaProjectId,
  getRecaptchaSiteKey,
  isRecaptchaVerificationEnabled,
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

export type RecaptchaVerifyResult =
  | { ok: true; score: number }
  | { ok: false; reason: "missing_token" | "misconfigured" | "invalid" | "upstream" };

/**
 * Verifies a reCAPTCHA Enterprise score token (server-only).
 * Does not log the token. On misconfiguration or when disabled, returns ok with score 1 (skip).
 */
export async function verifyRecaptchaEnterprise(
  token: string | null | undefined,
  expectedAction: RecaptchaAction,
  requestContext?: RecaptchaAssessmentRequestContext,
): Promise<RecaptchaVerifyResult> {
  if (!isRecaptchaVerificationEnabled()) {
    return { ok: true, score: 1 };
  }

  const trimmed = (token ?? "").trim();
  if (!trimmed) {
    return { ok: false, reason: "missing_token" };
  }

  const projectId = getRecaptchaProjectId();
  const apiKey = getRecaptchaApiKey();
  const siteKey = getRecaptchaSiteKey();
  if (!projectId || !apiKey || !siteKey) {
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
          expectedAction,
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
    console.warn("[recaptcha] assessment HTTP", expectedAction, res.status, errMsg || "(no body)");
    return { ok: false, reason: "upstream" };
  }

  const data = (await res.json()) as {
    tokenProperties?: { valid?: boolean; action?: string; invalidReason?: string };
    riskAnalysis?: { reasons?: string[]; score?: number };
  };

  const valid = data.tokenProperties?.valid === true;
  const action = data.tokenProperties?.action;
  const score = typeof data.riskAnalysis?.score === "number" ? data.riskAnalysis.score : 0;

  if (!valid) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[recaptcha] invalid token", data.tokenProperties?.invalidReason ?? "");
    }
    return { ok: false, reason: "invalid" };
  }

  if (action !== expectedAction) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[recaptcha] action mismatch", { expected: expectedAction, got: action });
    }
    return { ok: false, reason: "invalid" };
  }

  const min = getMinScore(expectedAction);
  if (score < min) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[recaptcha] low score", { score, min, action: expectedAction });
    }
    return { ok: false, reason: "invalid" };
  }

  return { ok: true, score };
}
