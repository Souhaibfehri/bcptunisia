import type { Locale, ServicePageBody, SubserviceMap } from "../types";
import type { ServiceSlug } from "@/data/services";
import { subserviceChunk1 } from "./chunks-part1";
import { subserviceChunk2 } from "./chunks-part2";
import { subserviceChunk3 } from "./chunks-part3";
import { subserviceChunk4 } from "./chunks-part4";
import { subserviceChunk5 } from "./chunks-part5";

export const subservicePages = {
  ...subserviceChunk1,
  ...subserviceChunk2,
  ...subserviceChunk3,
  ...subserviceChunk4,
  ...subserviceChunk5,
} as SubserviceMap;

export function getSubservicePage(
  locale: Locale,
  slug: ServiceSlug,
): ServicePageBody {
  const page = subservicePages[slug];
  if (!page) {
    throw new Error(`Missing subservice content for slug: ${slug}`);
  }
  return page[locale];
}
