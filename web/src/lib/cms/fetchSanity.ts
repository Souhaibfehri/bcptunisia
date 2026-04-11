import { unstable_cache } from "next/cache";
import { sanityClient } from "@/lib/sanity/client";

const SINGLETONS_QUERY = `{
  "site": *[_id == "siteSettings"][0],
  "nav": *[_id == "navigationSettings"][0],
  "home": *[_id == "homePageSettings"][0],
  "contact": *[_id == "contactPageSettings"][0],
  "company": *[_id == "companyPageSettings"][0],
  "visuals": *[_id == "marketingVisuals"][0]
}`;

export type SanitySingletonsBundle = Record<string, unknown> | null;

async function fetchSingletonsUncached(): Promise<SanitySingletonsBundle> {
  const client = sanityClient();
  if (!client) return null;
  try {
    return await client.fetch(SINGLETONS_QUERY);
  } catch {
    return null;
  }
}

export const getSanitySingletons = unstable_cache(
  fetchSingletonsUncached,
  ["sanity-cms-singletons"],
  { revalidate: 60 },
);

const FAQ_QUERY = `*[_type == "faqItem"] | order(sortOrder asc, _createdAt asc) {
  _id,
  category,
  question,
  answer
}`;

async function fetchFaqUncached() {
  const client = sanityClient();
  if (!client) return [];
  try {
    return await client.fetch(FAQ_QUERY);
  } catch {
    return [];
  }
}

export const getSanityFaqItems = unstable_cache(
  fetchFaqUncached,
  ["sanity-faq-items"],
  { revalidate: 60 },
);

const ARTICLES_QUERY = `*[_type == "article" && defined(slug.current)] | order(publishedAt desc) {
  _id,
  "slug": slug.current,
  publishedAt,
  title,
  excerpt,
  body,
  featuredImage
}`;

async function fetchArticlesUncached() {
  const client = sanityClient();
  if (!client) return [];
  try {
    return await client.fetch(ARTICLES_QUERY);
  } catch {
    return [];
  }
}

export const getSanityArticles = unstable_cache(
  fetchArticlesUncached,
  ["sanity-articles"],
  { revalidate: 60 },
);
