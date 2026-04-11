import type { DivisionId } from "./services";

export const mainNavKeys = [
  "home",
  "company",
  "services",
  "references",
  "projects",
  "industries",
  "maintenance",
  "contact",
  "faq",
  "news",
] as const;

export type MainNavKey = (typeof mainNavKeys)[number];

export const mainNavHrefs: Record<MainNavKey, string> = {
  home: "/",
  company: "/company",
  services: "/services",
  references: "/references",
  projects: "/projects",
  industries: "/industries",
  maintenance: "/maintenance",
  contact: "/contact",
  faq: "/faq",
  news: "/news",
};

/** Footer “Explorer” column — full list of useful destinations */
export const footerExploreKeys: MainNavKey[] = [
  "home",
  "company",
  "services",
  "references",
  "projects",
  "industries",
  "maintenance",
  "faq",
  "news",
  "contact",
];

export type DesktopNavBlock =
  | { kind: "link"; key: MainNavKey }
  | { kind: "mega" }
  | {
      kind: "dropdown";
      group: "projectsRefs" | "support";
      keys: MainNavKey[];
    };

/** Top-level desktop navigation (mega + grouped dropdowns) */
export const desktopNavBlocks: DesktopNavBlock[] = [
  { kind: "link", key: "home" },
  { kind: "link", key: "company" },
  { kind: "mega" },
  {
    kind: "dropdown",
    group: "projectsRefs",
    keys: ["references", "projects"],
  },
  {
    kind: "dropdown",
    group: "support",
    keys: ["industries", "maintenance", "faq", "news"],
  },
  { kind: "link", key: "contact" },
];

export const divisionPath = (id: DivisionId) => `/services/${id}`;

export const subservicePath = (division: DivisionId, slug: string) =>
  `/services/${division}/${slug}`;
