import { getSanitySingletons } from "@/lib/cms/fetchSanity";
import type { Locale } from "@/content/types";
import { pickLocale } from "@/lib/localePick";
import { urlForSanityImage } from "@/lib/sanity/image";

type Loc = { fr?: string; en?: string; ar?: string };
type TrustRow = { text?: Loc };

type HomeDoc = {
  heroKicker?: Loc;
  heroTitle?: Loc;
  heroSubtitle?: Loc;
  heroCtaQuote?: Loc;
  heroCtaExpert?: Loc;
  heroCtaBrochure?: Loc;
  heroFormTitle?: Loc;
  trustTitle?: Loc;
  trustItems?: TrustRow[];
  heroImage?: unknown;
  finalCtaTitle?: Loc;
  finalCtaBody?: Loc;
  finalCtaPrimary?: Loc;
  finalCtaSecondary?: Loc;
} | null;

const TRUST_KEYS = [
  "study",
  "install",
  "commission",
  "maintain",
  "support",
] as const;

export async function getHomePageMerged(
  locale: Locale,
  t: (key: string) => string,
) {
  const bundle = await getSanitySingletons();
  const h = (bundle?.home ?? null) as HomeDoc;

  let trustItems: string[];
  if (h?.trustItems && h.trustItems.length > 0) {
    trustItems = h.trustItems.map((row, i) => {
      const v = pickLocale(row.text ?? null, locale, "");
      if (v) return v;
      const k = TRUST_KEYS[i];
      return k ? t(`trust.${k}`) : "";
    });
  } else {
    trustItems = TRUST_KEYS.map((k) => t(`trust.${k}`));
  }

  return {
    heroKicker: pickLocale(h?.heroKicker ?? null, locale, t("hero.kicker")),
    heroTitle: pickLocale(h?.heroTitle ?? null, locale, t("hero.title")),
    heroSubtitle: pickLocale(h?.heroSubtitle ?? null, locale, t("hero.subtitle")),
    heroCtaQuote: pickLocale(h?.heroCtaQuote ?? null, locale, t("hero.ctaQuote")),
    heroCtaExpert: pickLocale(h?.heroCtaExpert ?? null, locale, t("hero.ctaExpert")),
    heroCtaBrochure: pickLocale(h?.heroCtaBrochure ?? null, locale, t("hero.ctaBrochure")),
    heroFormTitle: pickLocale(h?.heroFormTitle ?? null, locale, t("hero.heroFormTitle")),
    trustTitle: pickLocale(h?.trustTitle ?? null, locale, t("trust.title")),
    trustItems,
    finalCtaTitle: pickLocale(h?.finalCtaTitle ?? null, locale, t("finalCta.title")),
    finalCtaBody: pickLocale(h?.finalCtaBody ?? null, locale, t("finalCta.body")),
    finalCtaPrimary: pickLocale(h?.finalCtaPrimary ?? null, locale, t("finalCta.primary")),
    finalCtaSecondary: pickLocale(h?.finalCtaSecondary ?? null, locale, t("finalCta.secondary")),
    heroImageUrl: h?.heroImage ? urlForSanityImage(h.heroImage as never) : null,
  };
}
