/** Per–sector-card visuals (local fallbacks). */
const u = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1200&q=80`;

export const sectorCardImages = {
  industry: u("1581092160562-40aa08e78837"),
  tertiary: u("1497366754035-f200968a6e72"),
  retail: u("1441986300917-64674bd600d8"),
  health: u("1519494026892-80bbd2d6fd0d"),
  logistics: u("1565514020176-dbfddb4a4423"),
  infra: u("1503387762-592deb58ef4e"),
} as const;

export type SectorCardKey = keyof typeof sectorCardImages;
