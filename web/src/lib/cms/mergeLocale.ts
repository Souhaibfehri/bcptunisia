import type { LocaleStringPartial, LocaleTextPartial } from "@/lib/localePick";

export function mergeLocaleString(
  base: LocaleStringPartial,
  patch?: LocaleStringPartial | null,
): LocaleStringPartial {
  if (!patch) return { ...base };
  return {
    fr: patch.fr?.trim() || base.fr,
    en: patch.en?.trim() || base.en,
    ar: patch.ar?.trim() || base.ar,
  };
}

export function mergeLocaleText(
  base: LocaleTextPartial,
  patch?: LocaleTextPartial | null,
): LocaleTextPartial {
  if (!patch) return { ...base };
  return {
    fr: patch.fr?.trim() || base.fr,
    en: patch.en?.trim() || base.en,
    ar: patch.ar?.trim() || base.ar,
  };
}

export function mergeScalar(base: string, patch?: string | null): string {
  const t = patch?.trim();
  return t || base;
}
