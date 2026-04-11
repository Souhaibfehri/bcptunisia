import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import type { Locale } from "@/content/types";
import { SectionImageSplit } from "@/components/media/SectionImageSplit";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getCompanyPageMerged } from "@/lib/cms/companyResolved";

const DEFAULT_MEDIA =
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "company" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;
  const t = await getTranslations({ locale, namespace: "company" });
  const common = await getTranslations({ locale, namespace: "common" });
  const c = await getCompanyPageMerged(loc, (key) => t(key));
  const mediaSrc = c.mediaImageUrl ?? DEFAULT_MEDIA;

  return (
    <>
      <Breadcrumbs items={[{ href: "/company", label: t("h1") }]} />
      <section className="border-b border-bcp-border bg-bcp-surface py-14">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <h1 className="text-3xl font-semibold text-bcp-anthracite">{t("h1")}</h1>
          <p className="mt-4 text-lg text-bcp-muted">{c.lead}</p>
        </div>
      </section>
      <section className="border-b border-bcp-border bg-white py-16">
        <SectionImageSplit src={mediaSrc} alt={c.mediaAlt} imageSide="start">
          <h2 className="text-xl font-semibold text-bcp-anthracite md:text-2xl">
            {c.mediaHeading}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-bcp-muted">{c.mediaBody}</p>
        </SectionImageSplit>
      </section>
      <section className="py-14">
        <div className="mx-auto max-w-3xl space-y-6 px-4 text-sm leading-relaxed text-bcp-muted lg:px-6">
          <p>{c.body1}</p>
          <p>{c.body2}</p>
          <h2 className="pt-4 text-lg font-semibold text-bcp-anthracite">
            {c.valuesTitle}
          </h2>
          <ul className="list-disc space-y-2 ps-5">
            {c.valueLines.map((line, i) => (
              <li key={`${line.slice(0, 12)}-${i}`}>{line}</li>
            ))}
          </ul>
          <Link
            href="/services"
            className="inline-flex pt-4 text-sm font-semibold text-bcp-copper hover:underline"
          >
            {common("allServices")} →
          </Link>
        </div>
      </section>
    </>
  );
}
