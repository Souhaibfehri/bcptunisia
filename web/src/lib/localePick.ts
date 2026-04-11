import type { Locale } from "@/content/types";

export type LocaleStringPartial = {
  fr?: string | null;
  en?: string | null;
  ar?: string | null;
};

export type LocaleTextPartial = LocaleStringPartial;

/** Pick localized string with fallbacks fr → en → ar as needed */
export function pickLocale(
  obj: LocaleStringPartial | null | undefined,
  locale: Locale,
  fallback = "",
): string {
  if (!obj) return fallback;
  const direct = obj[locale]?.trim();
  if (direct) return direct;
  const order: Locale[] =
    locale === "fr" ? ["en", "ar"] : locale === "en" ? ["fr", "ar"] : ["fr", "en"];
  for (const L of order) {
    const v = obj[L]?.trim();
    if (v) return v;
  }
  return fallback;
}
