import { getSanitySingletons } from "@/lib/cms/fetchSanity";
import type { Locale } from "@/content/types";
import { pickLocale } from "@/lib/localePick";
import { urlForSanityImage } from "@/lib/sanity/image";

type Loc = { fr?: string; en?: string; ar?: string };

type ContactDoc = {
  lead?: Loc;
  asideTitle?: Loc;
  asideIntro?: Loc;
  mapHint?: Loc;
  pageImage?: unknown;
} | null;

export async function getContactPageMerged(locale: Locale, t: (key: string) => string) {
  const bundle = await getSanitySingletons();
  const c = (bundle?.contact ?? null) as ContactDoc;

  return {
    lead: pickLocale(c?.lead ?? null, locale, t("lead")),
    asideTitle: pickLocale(c?.asideTitle ?? null, locale, t("asideTitle")),
    asideIntro: pickLocale(c?.asideIntro ?? null, locale, t("asideBody")),
    mapHint: pickLocale(c?.mapHint ?? null, locale, t("mapPlaceholder")),
    pageImageUrl: c?.pageImage ? urlForSanityImage(c.pageImage as never) : null,
  };
}
