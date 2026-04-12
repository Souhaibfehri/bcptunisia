import type { RecaptchaAction } from "./actions";

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

/** API key for `assessments?key=` (stored server-only; never expose to client). */
export function getRecaptchaApiKey(): string {
  return trimEnv("RECAPTCHA_SECRET_KEY") || trimEnv("RECAPTCHA_API_KEY");
}

function parseScore(key: string, fallback: number): number {
  const raw = trimEnv(key);
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

const DEFAULTS: Record<RecaptchaAction, number> = {
  LOGIN: 0.5,
  SIGNUP: 0.5,
  RESET_PASSWORD_REQUEST: 0.5,
  CONTACT_FORM: 0.4,
  CREATE_USER: 0.5,
  INVITE_USER: 0.5,
};

export function getMinScore(action: RecaptchaAction): number {
  const map: Record<RecaptchaAction, string> = {
    LOGIN: "RECAPTCHA_MIN_SCORE_LOGIN",
    SIGNUP: "RECAPTCHA_MIN_SCORE_SIGNUP",
    RESET_PASSWORD_REQUEST: "RECAPTCHA_MIN_SCORE_RESET_PASSWORD_REQUEST",
    CONTACT_FORM: "RECAPTCHA_MIN_SCORE_CONTACT_FORM",
    CREATE_USER: "RECAPTCHA_MIN_SCORE_CREATE_USER",
    INVITE_USER: "RECAPTCHA_MIN_SCORE_INVITE_USER",
  };
  return parseScore(map[action], DEFAULTS[action]);
}

/** When false, verification is skipped (local dev without keys). */
export function isRecaptchaVerificationEnabled(): boolean {
  return !!(getRecaptchaSiteKey() && getRecaptchaProjectId() && getRecaptchaApiKey());
}
