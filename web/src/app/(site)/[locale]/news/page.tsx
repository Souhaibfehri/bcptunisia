import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import type { Locale } from "@/content/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { listArticles } from "@/lib/cms/articlesResolved";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "newsPage" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;
  const t = await getTranslations({ locale, namespace: "newsPage" });
  const articles = await listArticles(loc);

  return (
    <>
      <Breadcrumbs items={[{ href: "/news", label: t("h1") }]} />
      <section className="border-b border-bcp-border bg-bcp-surface py-14">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <h1 className="text-3xl font-semibold text-bcp-anthracite">{t("h1")}</h1>
          <p className="mt-4 text-sm text-bcp-muted">{t("lead")}</p>
        </div>
      </section>
      <section className="py-14">
        {articles.length === 0 ? (
          <p className="mx-auto max-w-3xl px-4 text-center text-sm text-bcp-muted lg:px-6">
            {t("empty")}
          </p>
        ) : (
          <ul className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2 lg:px-6">
            {articles.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/news/${a.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-bcp-border bg-white shadow-sm transition hover:border-bcp-gold/40"
                >
                  {a.imageUrl ? (
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        src={a.imageUrl}
                        alt=""
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.02]"
                        sizes="(max-width:768px) 100vw, 50vw"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    {a.publishedAt ? (
                      <time
                        dateTime={a.publishedAt}
                        className="text-xs text-bcp-muted"
                      >
                        {new Date(a.publishedAt).toLocaleDateString(locale, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    ) : null}
                    <h2 className="mt-2 text-lg font-semibold text-bcp-anthracite group-hover:text-bcp-copper">
                      {a.title}
                    </h2>
                    {a.excerpt ? (
                      <p className="mt-2 line-clamp-3 text-sm text-bcp-muted">
                        {a.excerpt}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
