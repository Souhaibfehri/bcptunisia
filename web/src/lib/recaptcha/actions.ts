/** Actions accepted by `/api/recaptcha/verify` (audit / validation; checkbox tokens are not action-scoped). */
export const RECAPTCHA_ACTIONS = [
  "LOGIN",
  "SIGNUP",
  "RESET_PASSWORD_REQUEST",
  "CREATE_USER",
  "INVITE_USER",
  "CONTACT_FORM",
] as const;

export type RecaptchaAction = (typeof RECAPTCHA_ACTIONS)[number];

export function isRecaptchaAction(value: string): value is RecaptchaAction {
  return (RECAPTCHA_ACTIONS as readonly string[]).includes(value);
}
