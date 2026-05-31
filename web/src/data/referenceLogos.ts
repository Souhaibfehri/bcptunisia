export type LocalReferenceLogo = {
  id: string;
  name: string;
  src: string;
};

/**
 * Explicit logo-to-name mapping.
 * Each entry was verified visually against the actual logo file.
 * Order = display order (marquee + grid).
 *
 * Logos skipped:
 *   ref-08.png — product photo (olive oil bottles), not a company logo
 *   ref-12.png — building photo, not a company logo
 */
export const LOCAL_REFERENCE_LOGOS: LocalReferenceLogo[] = [
  // ── Sécurité incendie & électronique ─────────────────────────────────────
  { id: "yazaki",    name: "YAZAKI",            src: "/references/logos/ref-02.png" },
  { id: "cofat",     name: "COFAT",             src: "/references/logos/ref-05.png" },
  { id: "amphenol",  name: "AMPHENOL COMPANY",  src: "/references/logos/ref-03.png" },
  { id: "figeac",    name: "FIGEAC AERO",       src: "/references/logos/ref-16.png" },
  { id: "mecachrome",name: "MECACHROME",        src: "/references/logos/ref-mecachrome.jpeg" },
  { id: "sofima",    name: "SOFIMA FILTER",     src: "/references/logos/ref-sofima-filter.jpeg" },
  { id: "kromberg",  name: "KROMBERG & SCHUBERT", src: "/references/logos/ref-15.png" },

  // ── Industrie & logistique ────────────────────────────────────────────────
  { id: "saida",     name: "SAÏDA",             src: "/references/logos/ref-13.png" },
  { id: "sotulub",   name: "SOTULUB",           src: "/references/logos/ref-20.png" },
  { id: "tom",       name: "TOM",               src: "/references/logos/ref-23.png" },
  { id: "lesieur",   name: "LESIEUR",           src: "/references/logos/ref-lesieur.jpeg" },
  { id: "aljazira",  name: "AL JAZIRA",         src: "/references/logos/ref-al-jazira.jpeg" },
  { id: "azur",      name: "AZUR PAPIER",       src: "/references/logos/ref-01.png" },
  { id: "siab",      name: "SIAB PLC",          src: "/references/logos/ref-17.png" },
  { id: "oradist",   name: "ORADIST",           src: "/references/logos/ref-oradist.jpeg" },
  { id: "ommp",      name: "OMMP",              src: "/references/logos/ref-ommp.jpeg" },

  // ── Tertiaire & services ──────────────────────────────────────────────────
  { id: "somef",     name: "SOMEF",             src: "/references/logos/ref-21.png" },
  { id: "star",      name: "STAR ASSURANCES",   src: "/references/logos/ref-22.png" },
  { id: "iffco",     name: "IFFCO GROUP",       src: "/references/logos/ref-14.png" },
  { id: "forum",     name: "FORUM GROUP",       src: "/references/logos/ref-10.png" },
  { id: "coats",     name: "COATS",             src: "/references/logos/ref-04.png" },
  { id: "ancs",      name: "ANCS",              src: "/references/logos/ref-ancs.jpeg" },

  // ── Santé ─────────────────────────────────────────────────────────────────
  { id: "clinique-mutuelleville", name: "CLINIQUE MUTUELLEVILLE", src: "/references/logos/ref-clinique-mutuelleville.jpeg" },
  { id: "saiph",     name: "SAIPH",             src: "/references/logos/ref-18.png" },
  { id: "sartorius", name: "SORTARIUS TUNISIA", src: "/references/logos/ref-19.png" },

  // ── Enseignement & autres ─────────────────────────────────────────────────
  { id: "esiet",     name: "ESIET UAS",         src: "/references/logos/ref-07.png" },
  { id: "f4t",       name: "F4T",               src: "/references/logos/ref-09.png" },
];

export function getLocalReferenceLogoEntries(): LocalReferenceLogo[] {
  return LOCAL_REFERENCE_LOGOS;
}
