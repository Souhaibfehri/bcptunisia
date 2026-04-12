import type { RecaptchaAction } from "./actions";
import {
  getMinScore,
  getRecaptchaApiKey,
  getRecaptchaProjectId,
  getRecaptchaSiteKey,
  isRecaptchaVerificationEnabled,
} from "./config";

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
      headers: { "Content-Type": "application/json" },
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
    if (process.env.NODE_ENV === "development") {
      console.warn("[recaptcha] assessment HTTP", res.status);
    }
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
