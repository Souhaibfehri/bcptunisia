function trimEnv(key: string): string {
  return process.env[key]?.trim() ?? "";
}

/** Public site key (client + server assessment body). */
export function getRecaptchaSiteKey(): string {
  return trimEnv("NEXT_PUBLIC_RECAPTCHA_SITE_KEY");
}

export function getRecaptchaProjectId(): string {
  return trimEnv("RECAPTCHA_PROJECT_ID");
}

/**
 * Google Cloud API key for `.../assessments?key=` (string like `AIza...`).
 * Prefer RECAPTCHA_API_KEY. Do not put the full assessments URL here — only the key value.
 */
export function getRecaptchaApiKey(): string {
  return trimEnv("RECAPTCHA_API_KEY") || trimEnv("RECAPTCHA_SECRET_KEY");
}

/** When false, verification is skipped (local dev without keys). */
export function isRecaptchaVerificationEnabled(): boolean {
  return !!(getRecaptchaSiteKey() && getRecaptchaProjectId() && getRecaptchaApiKey());
}
