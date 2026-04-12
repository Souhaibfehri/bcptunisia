import { getRecaptchaApiKey, getRecaptchaProjectId } from "@/lib/recaptcha/config";

function trimEnv(key: string): string {
  return process.env[key]?.trim() ?? "";
}

function serverSiteKey(): string {
  return trimEnv("RECAPTCHA_SITE_KEY") || trimEnv("NEXT_PUBLIC_RECAPTCHA_SITE_KEY");
}

function contactRecaptchaServerReady(): boolean {
  return !!(getRecaptchaProjectId() && getRecaptchaApiKey() && serverSiteKey());
}

/**
 * Public lead form: Enterprise REST CreateAssessment (checkbox tokens).
 * Does not send expectedAction — checkbox keys often omit / differ from score actions and
 * Google may mark assessments invalid if expectedAction mismatches.
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

  if (!contactRecaptchaServerReady()) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[recaptcha/contact] missing server config (RECAPTCHA_PROJECT_ID, RECAPTCHA_SECRET_KEY or RECAPTCHA_API_KEY, RECAPTCHA_SITE_KEY or NEXT_PUBLIC_RECAPTCHA_SITE_KEY)",
      );
    }
    return { ok: false, reason: "misconfigured" };
  }

  const projectId = getRecaptchaProjectId();
  const apiKey = getRecaptchaApiKey();
  const siteKey = serverSiteKey();
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
        },
      }),
      cache: "no-store",
    });
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[recaptcha/contact] network", e instanceof Error ? e.message : "unknown");
    }
    return { ok: false, reason: "upstream" };
  }

  if (!res.ok) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[recaptcha/contact] assessment HTTP", res.status);
    }
    return { ok: false, reason: "upstream" };
  }

  const data = (await res.json()) as {
    tokenProperties?: { valid?: boolean; invalidReason?: string };
  };

  const valid = data.tokenProperties?.valid === true;

  if (!valid) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[recaptcha/contact] invalid", data.tokenProperties?.invalidReason ?? "");
    }
    return { ok: false, reason: "invalid" };
  }

  return { ok: true };
}
