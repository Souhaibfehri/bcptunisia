import type { Locale } from "@/content/types";
import { getSanityArticles } from "@/lib/cms/fetchSanity";
import { pickLocale } from "@/lib/localePick";
import { urlForSanityImage } from "@/lib/sanity/image";

type Loc = { fr?: string; en?: string; ar?: string };

type RawArticle = {
  _id: string;
  slug: string;
  publishedAt?: string;
  title?: Loc;
  excerpt?: Loc;
  body?: Loc;
  featuredImage?: unknown;
};

export type ArticleCard = {
  id: string;
  slug: string;
  publishedAt: string | null;
  title: string;
  excerpt: string;
  imageUrl: string | null;
};

export type ArticleDetail = ArticleCard & { body: string };

function mapCard(row: RawArticle, locale: Locale): ArticleCard {
  return {
    id: row._id,
    slug: row.slug,
    publishedAt: row.publishedAt ?? null,
    title: pickLocale(row.title ?? null, locale, ""),
    excerpt: pickLocale(row.excerpt ?? null, locale, ""),
    imageUrl: urlForSanityImage(row.featuredImage),
  };
}

export async function listArticles(locale: Locale): Promise<ArticleCard[]> {
  const rows = (await getSanityArticles()) as RawArticle[];
  if (!rows?.length) return [];
  return rows
    .filter((r) => r.slug && pickLocale(r.title ?? null, locale, ""))
    .map((r) => mapCard(r, locale));
}

export async function getArticleBySlug(
  slug: string,
  locale: Locale,
): Promise<ArticleDetail | null> {
  const rows = (await getSanityArticles()) as RawArticle[];
  const row = rows.find((r) => r.slug === slug);
  if (!row) return null;
  const title = pickLocale(row.title ?? null, locale, "");
  if (!title) return null;
  return {
    ...mapCard(row, locale),
    title,
    body: pickLocale(row.body ?? null, locale, ""),
  };
}
