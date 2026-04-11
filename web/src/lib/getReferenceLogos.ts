import type { Locale } from "@/content/types";
import { getLocalReferenceLogoEntries } from "@/data/referenceLogos";
import { sanityClient } from "@/lib/sanity/client";

const REFERENCE_QUERY = `*[_type == "clientReference" && defined(logo.asset)] | order(sortOrder asc, _createdAt asc) {
  "id": _id,
  "src": logo.asset->url,
  nameFr,
  nameEn,
  nameAr
}`;

type SanityRefRow = {
  id: string;
  src: string;
  nameFr?: string;
  nameEn?: string;
  nameAr?: string;
};

export type ReferenceLogo = {
  id: string;
  name: string;
  src: string;
};

function nameForLocale(row: SanityRefRow, locale: Locale): string {
  if (locale === "fr" && row.nameFr) return row.nameFr;
  if (locale === "en" && row.nameEn) return row.nameEn;
  if (locale === "ar" && row.nameAr) return row.nameAr;
  return row.nameEn || row.nameFr || row.nameAr || "Reference";
}

export async function getReferenceLogos(locale: Locale): Promise<ReferenceLogo[]> {
  const client = sanityClient();
  if (client) {
    try {
      const rows = await client.fetch<SanityRefRow[]>(REFERENCE_QUERY);
      if (rows?.length) {
        return rows
          .filter((r) => r.src)
          .map((r) => ({
            id: r.id,
            src: r.src,
            name: nameForLocale(r, locale),
          }));
      }
    } catch {
      /* fallback below */
    }
  }
  return getLocalReferenceLogoEntries();
}
