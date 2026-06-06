export type DivisionId =
  | "fire-safety"
  | "electronic-security"
  | "industrial-fluids"
  | "industrial-electrical"
  | "engineering-services";

export type ServiceSlug =
  | "fire-detection-ssi"
  | "gas-leak-detection"
  | "fire-hose-networks-ria-pia"
  | "dry-wet-risers"
  | "automatic-water-extinguishing-sprinkler"
  | "automatic-gas-extinguishing"
  | "fire-extinguisher-maintenance"
  | "emergency-lighting"
  | "fire-compartmentation"
  | "evacuation-intervention-plans"
  | "fire-hydrants"
  | "smoke-extraction"
  | "spark-detection"
  | "video-surveillance"
  | "access-control"
  | "intrusion-detection"
  | "control-room-supervision"
  | "queue-management"
  | "nurse-call-systems"
  | "hvac-cvc"
  | "industrial-utilities"
  | "compressed-air"
  | "plumbing-sanitary"
  | "medical-gas"
  | "pools-fountains"
  | "water-tanks"
  | "electrical-installation"
  | "thermographic-inspection"
  | "electrical-cabinet-assembly"
  | "design-studies"
  | "technical-support"
  | "troubleshooting-assistance"
  | "installation"
  | "equipment-sales"
  | "preventive-corrective-maintenance"
  | "signalisation";

export const divisions: {
  id: DivisionId;
  slugs: ServiceSlug[];
  /** Subset of slugs shown in the mega menu. Falls back to slugs if omitted. */
  menuSlugs?: ServiceSlug[];
}[] = [
  {
    id: "fire-safety",
    slugs: [
      "fire-detection-ssi",
      "gas-leak-detection",
      "fire-hose-networks-ria-pia",
      "dry-wet-risers",
      "automatic-water-extinguishing-sprinkler",
      "automatic-gas-extinguishing",
      "fire-extinguisher-maintenance",
      "emergency-lighting",
      "fire-compartmentation",
      "evacuation-intervention-plans",
      "fire-hydrants",
      "smoke-extraction",
      "spark-detection",
    ],
    // Show every fire-safety service in the mega menu (now that the grouped
    // entries have been split into distinct items). The list is scrollable.
  },
  {
    id: "electronic-security",
    slugs: [
      "video-surveillance",
      "access-control",
      "intrusion-detection",
      "control-room-supervision",
      "queue-management",
      "nurse-call-systems",
    ],
  },
  {
    id: "industrial-fluids",
    slugs: [
      "hvac-cvc",
      "industrial-utilities",
      "compressed-air",
      "plumbing-sanitary",
      "medical-gas",
      "pools-fountains",
      "water-tanks",
    ],
  },
  {
    id: "industrial-electrical",
    slugs: [
      "electrical-installation",
      "thermographic-inspection",
      "electrical-cabinet-assembly",
    ],
  },
  {
    id: "engineering-services",
    slugs: [
      "design-studies",
      "technical-support",
      "troubleshooting-assistance",
      "installation",
      "equipment-sales",
      "preventive-corrective-maintenance",
      "signalisation",
    ],
  },
];

export function getDivisionForSlug(slug: ServiceSlug): DivisionId | undefined {
  for (const d of divisions) {
    if (d.slugs.includes(slug)) return d.id;
  }
  return undefined;
}

export function isValidDivision(id: string): id is DivisionId {
  return divisions.some((d) => d.id === id);
}

export function isValidServiceSlug(slug: string): slug is ServiceSlug {
  return divisions.some((d) => d.slugs.includes(slug as ServiceSlug));
}

export const allServiceSlugs: ServiceSlug[] = divisions.flatMap((d) => d.slugs);
