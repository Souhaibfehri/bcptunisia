import { getSanitySingletons } from "@/lib/cms/fetchSanity";
import type { Locale } from "@/content/types";
import { pickLocale } from "@/lib/localePick";
import { urlForSanityImage } from "@/lib/sanity/image";

type Loc = { fr?: string; en?: string; ar?: string };
type ValueRow = { text?: Loc };

type CompanyDoc = {
  lead?: Loc;
  body1?: Loc;
  body2?: Loc;
  valuesTitle?: Loc;
  values?: ValueRow[];
  mediaHeading?: Loc;
  mediaBody?: Loc;
  mediaAlt?: Loc;
  mediaImage?: unknown;
} | null;

const VALUE_KEYS = ["safety", "quality", "continuity", "clarity"] as const;

export async function getCompanyPageMerged(locale: Locale, t: (key: string) => string) {
  const bundle = await getSanitySingletons();
  const c = (bundle?.company ?? null) as CompanyDoc;

  let valueLines: string[];
  if (c?.values && c.values.length > 0) {
    valueLines = c.values.map((v, i) => {
      const line = pickLocale(v.text ?? null, locale, "");
      if (line) return line;
      const k = VALUE_KEYS[i];
      return k ? t(`values.${k}`) : "";
    });
  } else {
    valueLines = VALUE_KEYS.map((k) => t(`values.${k}`));
  }

  return {
    lead: pickLocale(c?.lead ?? null, locale, t("lead")),
    body1: pickLocale(c?.body1 ?? null, locale, t("body1")),
    body2: pickLocale(c?.body2 ?? null, locale, t("body2")),
    valuesTitle: pickLocale(c?.valuesTitle ?? null, locale, t("valuesTitle")),
    valueLines,
    mediaHeading: pickLocale(c?.mediaHeading ?? null, locale, t("mediaHeading")),
    mediaBody: pickLocale(c?.mediaBody ?? null, locale, t("mediaBody")),
    mediaAlt: pickLocale(c?.mediaAlt ?? null, locale, t("mediaAlt")),
    mediaImageUrl: c?.mediaImage ? urlForSanityImage(c.mediaImage as never) : null,
  };
}
