import {
  DEFAULT_VISUAL_IMAGES,
  type VisualPlacementKey,
  VISUAL_KEYS,
} from "@/data/visualPlaceholders";
import { getSanitySingletons } from "@/lib/cms/fetchSanity";
import type { Locale } from "@/content/types";
import { pickLocale, type LocaleStringPartial } from "@/lib/localePick";
import { urlForSanityImage } from "@/lib/sanity/image";

type PlacementRow = {
  key?: string;
  image?: unknown;
  alt?: LocaleStringPartial;
};

const ALT_FALLBACK: Record<VisualPlacementKey, LocaleStringPartial> = {
  "services-index": {
    fr: "Ingénierie et interventions techniques sur site industriel",
    en: "Engineering and on-site technical work in an industrial setting",
    ar: "هندسة وتدخلات تقنية في موقع صناعي",
  },
  industries: {
    fr: "Site industriel et logistique",
    en: "Industrial and logistics facility",
    ar: "منشأة صناعية ولوجستية",
  },
  maintenance: {
    fr: "Technicien en contrôle d’installations",
    en: "Technician inspecting building systems",
    ar: "فني يفحص التجهيزات",
  },
  "division-fire-safety": {
    fr: "Systèmes de sécurité incendie",
    en: "Fire safety systems",
    ar: "أنظمة السلامة من الحريق",
  },
  "division-electronic-security": {
    fr: "Salle de supervision et sécurité électronique",
    en: "Control room and electronic security",
    ar: "غرفة مراقبة وأمن إلكتروني",
  },
  "division-industrial-fluids": {
    fr: "Installations fluides et CVC",
    en: "Fluid systems and HVAC",
    ar: "منشآت السوائل والتكييف",
  },
  "division-industrial-electrical": {
    fr: "Armoires et distribution électrique",
    en: "Electrical cabinets and distribution",
    ar: "خزانات وتوزيع كهربائي",
  },
  "division-engineering-services": {
    fr: "Ingénierie et chantier technique",
    en: "Engineering and technical construction site",
    ar: "هندسة وموقع تقني",
  },
};

export async function getVisualForPlacement(
  key: VisualPlacementKey,
  locale: Locale,
): Promise<{ src: string; alt: string }> {
  const bundle = await getSanitySingletons();
  const doc = bundle?.visuals as { placements?: PlacementRow[] } | null;
  const row = doc?.placements?.find((p) => p.key === key);
  const fromCms = row?.image ? urlForSanityImage(row.image as never) : null;
  const src = fromCms || DEFAULT_VISUAL_IMAGES[key];
  const alt = pickLocale(
    mergeAlt(row?.alt, ALT_FALLBACK[key]),
    locale,
    pickLocale(ALT_FALLBACK[key], locale, ""),
  );
  return { src, alt };
}

function mergeAlt(
  patch?: LocaleStringPartial,
  base?: LocaleStringPartial,
): LocaleStringPartial {
  return {
    fr: patch?.fr?.trim() || base?.fr,
    en: patch?.en?.trim() || base?.en,
    ar: patch?.ar?.trim() || base?.ar,
  };
}

/** For debugging / future gallery */
export async function listResolvedVisualKeys(): Promise<VisualPlacementKey[]> {
  return [...VISUAL_KEYS];
}
