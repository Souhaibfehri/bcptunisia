import { getTranslations } from "next-intl/server";
import type { Locale } from "@/content/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { getFaqPageItems } from "@/lib/cms/faqMerged";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faqPage" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;
  const t = await getTranslations({ locale, namespace: "faqPage" });
  const fallback = (["q1", "q2", "q3", "q4"] as const).map((key) => ({
    id: `fallback-${key}`,
    q: t(`items.${key}.q`),
    a: t(`items.${key}.a`),
  }));
  const items = await getFaqPageItems(loc, fallback);

  return (
    <>
      <Breadcrumbs items={[{ href: "/faq", label: t("h1") }]} />
      <section className="border-b border-bcp-border bg-bcp-surface py-14">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <h1 className="text-3xl font-semibold text-bcp-anthracite">{t("h1")}</h1>
          <p className="mt-4 text-sm text-bcp-muted">{t("lead")}</p>
        </div>
      </section>
      <FaqAccordion title={t("listTitle")} items={items} />
    </>
  );
}
