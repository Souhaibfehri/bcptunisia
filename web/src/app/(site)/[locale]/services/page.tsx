import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import type { Locale } from "@/content/types";
import { divisions } from "@/data/services";
import { divisionPath } from "@/data/nav";
import { divisionToVisualKey } from "@/data/visualPlaceholders";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FeatureImageCard } from "@/components/media/FeatureImageCard";
import { SectionHeroBand } from "@/components/media/SectionHeroBand";
import { getVisualForPlacement } from "@/lib/cms/visualsResolved";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesIndex" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;
  const t = await getTranslations({ locale, namespace: "servicesIndex" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  const hero = await getVisualForPlacement("services-index", loc);
  const cards = await Promise.all(
    divisions.map(async (d) => ({
      d,
      visual: await getVisualForPlacement(divisionToVisualKey(d.id), loc),
    })),
  );

  return (
    <>
      <Breadcrumbs items={[{ href: "/services", label: t("h1") }]} />
      <SectionHeroBand src={hero.src} alt={hero.alt} priority>
        <h1 className="text-3xl font-semibold md:text-4xl">{t("h1")}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">
          {t("lead")}
        </p>
      </SectionHeroBand>
      <section className="py-14">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2 lg:px-6">
          {cards.map(({ d, visual }) => (
            <FeatureImageCard
              key={d.id}
              href={divisionPath(d.id)}
              src={visual.src}
              alt={visual.alt}
              title={nav(`divisions.pillars.${d.id}.title`)}
              subtitle={
                locale === "fr"
                  ? `${d.slugs.length} sous-domaines`
                  : locale === "ar"
                    ? `${d.slugs.length} مجالات فرعية`
                    : `${d.slugs.length} sub-areas`
              }
              footer={<>{t("ctaPillar")} →</>}
            />
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-6xl px-4 text-center lg:px-6">
          <Link
            href="/contact"
            className="inline-flex rounded-full bg-bcp-anthracite px-6 py-3 text-sm font-semibold text-white"
          >
            {t("ctaContact")}
          </Link>
        </div>
      </section>
    </>
  );
}
