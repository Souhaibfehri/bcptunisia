/**
 * Sanity project connection. Override with NEXT_PUBLIC_SANITY_* in `.env.local`.
 * Defaults match the production BCP Tunisia Sanity project (public IDs).
 */
export const sanityProjectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || "rbaoo9sa";

export const sanityDataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
