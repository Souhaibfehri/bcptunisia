import { createClient, type SanityClient } from "next-sanity";
import { sanityDataset, sanityProjectId } from "../../../sanity/env";

export function isSanityConfigured(): boolean {
  return Boolean(sanityProjectId);
}

export function sanityClient(): SanityClient | null {
  if (!sanityProjectId) return null;
  return createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: "2024-11-15",
    useCdn: true,
  });
}
