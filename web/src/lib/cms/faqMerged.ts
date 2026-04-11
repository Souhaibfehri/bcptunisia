import type { Locale } from "@/content/types";
import { getSanityFaqItems } from "@/lib/cms/fetchSanity";
import { pickLocale } from "@/lib/localePick";

type Loc = { fr?: string; en?: string; ar?: string };

type FaqRow = {
  _id: string;
  question?: Loc;
  answer?: Loc;
};

export async function getFaqPageItems(
  locale: Locale,
  fallback: { id: string; q: string; a: string }[],
): Promise<{ id: string; q: string; a: string }[]> {
  const rows = (await getSanityFaqItems()) as FaqRow[];
  if (!rows?.length) return fallback;

  const mapped = rows
    .map((r) => {
      const q = pickLocale(r.question ?? null, locale, "");
      const a = pickLocale(r.answer ?? null, locale, "");
      return { id: r._id, q, a };
    })
    .filter((x) => x.q && x.a);

  return mapped.length ? mapped : fallback;
}
