import type { DivisionId } from "./services";

const u = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1600&q=80`;

export const VISUAL_KEYS = [
  "services-index",
  "industries",
  "maintenance",
  "division-fire-safety",
  "division-electronic-security",
  "division-industrial-fluids",
  "division-industrial-electrical",
  "division-engineering-services",
] as const;

export type VisualPlacementKey = (typeof VISUAL_KEYS)[number];

export const DEFAULT_VISUAL_IMAGES: Record<VisualPlacementKey, string> = {
  "services-index":               u("1581092160562-40aa08e78837"),
  industries:                     u("1565514020176-dbfddb4a4423"),
  maintenance:                    u("1581091226825-a6a2a5aee158"),
  // Division heroes — local images from /public/images/services/
  "division-fire-safety":         "/images/services/service-sprinkler-manifold.jpeg",
  "division-electronic-security": "/images/services/service-cctv-cameras.jpeg",
  "division-industrial-fluids":   "/images/services/service-air-comprime-room.jpeg",
  "division-industrial-electrical": "/images/services/service-electrician-panel.jpeg",
  "division-engineering-services": u("1581094794329-c8112a89af12"),
};

export function divisionToVisualKey(id: DivisionId): VisualPlacementKey {
  const map: Record<DivisionId, VisualPlacementKey> = {
    "fire-safety": "division-fire-safety",
    "electronic-security": "division-electronic-security",
    "industrial-fluids": "division-industrial-fluids",
    "industrial-electrical": "division-industrial-electrical",
    "engineering-services": "division-engineering-services",
  };
  return map[id];
}
