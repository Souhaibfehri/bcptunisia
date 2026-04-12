import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
import { PUBLIC_LEAD_RECAPTCHA_ACTION } from "@/lib/recaptcha/publicLeadRecaptchaAction";

let client: RecaptchaEnterpriseServiceClient | null = null;

function getClient(): RecaptchaEnterpriseServiceClient {
  if (!client) client = new RecaptchaEnterpriseServiceClient();
  return client;
}

function trimEnv(key: string): string {
  return process.env[key]?.trim() ?? "";
}

function serverSiteKey(): string {
  return trimEnv("RECAPTCHA_SITE_KEY") || trimEnv("NEXT_PUBLIC_RECAPTCHA_SITE_KEY");
}

function hasGoogleApplicationCredentials(): boolean {
  return !!(trimEnv("GOOGLE_APPLICATION_CREDENTIALS") || trimEnv("GOOGLE_CLOUD_KEY_FILE"));
}

/**
 * When `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set, the public lead form must pass a token and server must verify.
 * When unset (local dev), verification is skipped.
 */
export async function verifyPublicLeadRecaptchaCheckboxToken(
  token: string | null | undefined,
): Promise<{ ok: true } | { ok: false; reason: "missing" | "invalid" | "upstream" | "misconfigured" }> {
  const publicKey = trimEnv("NEXT_PUBLIC_RECAPTCHA_SITE_KEY");
  if (!publicKey) {
    return { ok: true };
  }

  const trimmed = (token ?? "").trim();
  if (!trimmed) {
    return { ok: false, reason: "missing" };
  }

  const projectId = trimEnv("RECAPTCHA_PROJECT_ID");
  const siteKey = serverSiteKey();
  if (!projectId || !siteKey || !hasGoogleApplicationCredentials()) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[recaptcha/contact] missing server config (RECAPTCHA_PROJECT_ID, RECAPTCHA_SITE_KEY or NEXT_PUBLIC_*, GOOGLE_APPLICATION_CREDENTIALS)",
      );
    }
    return { ok: false, reason: "misconfigured" };
  }

  try {
    const c = getClient();
    const parent = `projects/${projectId}`;
    const [assessment] = await c.createAssessment({
      parent,
      assessment: {
        event: {
          token: trimmed,
          siteKey,
          expectedAction: PUBLIC_LEAD_RECAPTCHA_ACTION,
        },
      },
    });

    const valid = assessment.tokenProperties?.valid === true;
    const action = assessment.tokenProperties?.action;

    if (!valid) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[recaptcha/contact] invalid", assessment.tokenProperties?.invalidReason ?? "");
      }
      return { ok: false, reason: "invalid" };
    }

    if (action && action !== PUBLIC_LEAD_RECAPTCHA_ACTION) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[recaptcha/contact] action mismatch", { expected: PUBLIC_LEAD_RECAPTCHA_ACTION, got: action });
      }
      return { ok: false, reason: "invalid" };
    }

    return { ok: true };
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[recaptcha/contact] upstream", e instanceof Error ? e.message : "unknown");
    }
    return { ok: false, reason: "upstream" };
  }
}
