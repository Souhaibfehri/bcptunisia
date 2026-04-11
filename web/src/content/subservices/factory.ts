import type { Locale, ServicePageBody } from "../types";
import { serviceSectionTitles, standardLifecycle } from "../lifecycle";

type CoreFields = Omit<
  ServicePageBody,
  | "needsTitle"
  | "providesTitle"
  | "lifecycleTitle"
  | "lifecycle"
  | "sectorsTitle"
  | "faqTitle"
>;

export function buildServicePage(
  fr: CoreFields,
  en: CoreFields,
  ar: CoreFields,
): Record<Locale, ServicePageBody> {
  return {
    fr: {
      ...serviceSectionTitles.fr,
      ...fr,
      lifecycle: standardLifecycle.fr,
    },
    en: {
      ...serviceSectionTitles.en,
      ...en,
      lifecycle: standardLifecycle.en,
    },
    ar: {
      ...serviceSectionTitles.ar,
      ...ar,
      lifecycle: standardLifecycle.ar,
    },
  };
}
