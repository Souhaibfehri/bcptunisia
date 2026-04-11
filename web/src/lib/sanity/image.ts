import imageUrlBuilder from "@sanity/image-url";
import { sanityClient } from "./client";

export function urlForSanityImage(
  source: unknown,
  width = 1600,
): string | null {
  const client = sanityClient();
  if (!client || !source) return null;
  try {
    return imageUrlBuilder(client).image(source as never).width(width).quality(85).url();
  } catch {
    return null;
  }
}
