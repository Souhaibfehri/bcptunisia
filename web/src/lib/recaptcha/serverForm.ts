import { redirect } from "next/navigation";
import type { RecaptchaAction } from "./actions";
import { verifyRecaptchaEnterprise } from "./verify";

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
  const token = String(formData.get("recaptcha_token") ?? "").trim();
  const result = await verifyRecaptchaEnterprise(token, action);
  if (!result.ok) {
    redirectError(
      redirectPath,
      "Vérification de sécurité échouée. Réessayez.",
    );
  }
}
