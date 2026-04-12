import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { RecaptchaAction } from "./actions";
import { isRecaptchaVerificationEnabled } from "./config";
import { verifyEnterpriseCheckboxAssessment } from "./verify";

function redirectError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

/**
 * Validates `recaptcha_token` from a server action FormData when reCAPTCHA is enabled.
 */
export async function assertRecaptchaFromFormData(
  formData: FormData,
  action: RecaptchaAction,
  redirectPath: string,
): Promise<void> {
  if (!isRecaptchaVerificationEnabled()) {
    return;
  }
  const token = String(formData.get("recaptcha_token") ?? "").trim();
  const h = await headers();
  const result = await verifyEnterpriseCheckboxAssessment(token, {
    referer: h.get("referer"),
    userAgent: h.get("user-agent"),
  });
  if (!result.ok) {
    redirectError(
      redirectPath,
      "Vérification de sécurité échouée. Réessayez.",
    );
  }
}
