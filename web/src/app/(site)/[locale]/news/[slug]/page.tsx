import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link, routing } from "@/i18n/routing";
import type { Locale } from "@/content/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getArticleBySlug } from "@/lib/cms/articlesResolved";
import { sanityClient } from "@/lib/sanity/client";

export async function generateStaticParams() {
  const client = sanityClient();
  if (!client) return [];
  const slugs = await client.fetch<string[]>(
    `*[_type == "article" && defined(slug.current)].slug.current`,
  );
  const out: { locale: string; slug: string }[] = [];
  for (const loc of routing.locales) {
    for (const slug of slugs) {
      out.push({ locale: loc, slug });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const article = await getArticleBySlug(slug, loc);
  if (!article) return { title: "News" };
  return {
    title: article.title,
    description: article.excerpt || undefined,
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const t = await getTranslations({ locale, namespace: "newsPage" });
  const article = await getArticleBySlug(slug, loc);
  if (!article) notFound();

  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/news", label: t("h1") },
          { href: `/news/${slug}`, label: article.title },
        ]}
      />
      <article className="border-b border-bcp-border bg-bcp-surface py-14">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          {article.publishedAt ? (
            <time dateTime={article.publishedAt} className="text-xs text-bcp-muted">
              {new Date(article.publishedAt).toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          ) : null}
          <h1 className="mt-3 text-3xl font-semibold text-bcp-anthracite">
            {article.title}
          </h1>
          {article.excerpt ? (
            <p className="mt-4 text-sm text-bcp-muted">{article.excerpt}</p>
          ) : null}
        </div>
      </article>
      {article.imageUrl ? (
        <div className="border-b border-bcp-border bg-white py-10">
          <div className="mx-auto max-w-4xl px-4 lg:px-6">
            <div className="relative aspect-[2/1] overflow-hidden rounded-2xl border border-bcp-border">
              <Image
                src={article.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 56rem"
                priority
              />
            </div>
          </div>
        </div>
      ) : null}
      <section className="py-14">
        <div className="mx-auto max-w-3xl px-4 text-sm leading-relaxed text-bcp-muted lg:px-6">
          <div className="whitespace-pre-wrap">{article.body}</div>
          <Link
            href="/news"
            className="mt-10 inline-block text-sm font-medium text-bcp-copper hover:underline"
          >
            ← {t("h1")}
          </Link>
        </div>
      </section>
    </>
  );
}
