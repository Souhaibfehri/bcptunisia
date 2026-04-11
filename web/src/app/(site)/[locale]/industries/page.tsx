import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { Locale } from "@/content/types";
import { sectorCardImages, type SectorCardKey } from "@/data/sectorCardImages";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeroBand } from "@/components/media/SectionHeroBand";
import { SectionImageSplit } from "@/components/media/SectionImageSplit";
import { getVisualForPlacement } from "@/lib/cms/visualsResolved";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "industriesPage" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const CARD_KEYS: SectorCardKey[] = [
  "industry",
  "tertiary",
  "retail",
  "health",
  "logistics",
  "infra",
];

export default async function IndustriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;
  const t = await getTranslations({ locale, namespace: "industriesPage" });
  const hero = await getVisualForPlacement("industries", loc);
  const splitVisual = await getVisualForPlacement("services-index", loc);

  return (
    <>
      <Breadcrumbs items={[{ href: "/industries", label: t("h1") }]} />
      <SectionHeroBand src={hero.src} alt={hero.alt} priority>
        <h1 className="text-3xl font-semibold md:text-4xl">{t("h1")}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">
          {t("lead")}
        </p>
      </SectionHeroBand>
      <section className="border-b border-bcp-border bg-white py-16">
        <SectionImageSplit
          src={splitVisual.src}
          alt={splitVisual.alt}
          imageSide="end"
        >
          <h2 className="text-xl font-semibold text-bcp-anthracite md:text-2xl">
            {t("visualHeading")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-bcp-muted">
            {t("visualBody")}
          </p>
        </SectionImageSplit>
      </section>
      <section className="py-14">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2 lg:px-6">
          {CARD_KEYS.map((key) => (
            <article
              key={key}
              className="overflow-hidden rounded-2xl border border-bcp-border bg-white shadow-sm"
            >
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={sectorCardImages[key]}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-8">
                <h2 className="text-lg font-semibold text-bcp-anthracite">
                  {t(`cards.${key}.title`)}
                </h2>
                <p className="mt-3 text-sm text-bcp-muted">
                  {t(`cards.${key}.body`)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
