import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import type { Locale } from "@/content/types";
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
  const t = await getTranslations({ locale, namespace: "maintenancePage" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function MaintenancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;
  const t = await getTranslations({ locale, namespace: "maintenancePage" });
  const keys = ["preventive", "corrective", "contract"] as const;
  const hero = await getVisualForPlacement("maintenance", loc);
  const splitVisual = await getVisualForPlacement(
    "division-engineering-services",
    loc,
  );

  return (
    <>
      <Breadcrumbs items={[{ href: "/maintenance", label: t("h1") }]} />
      <SectionHeroBand src={hero.src} alt={hero.alt} priority>
        <h1 className="text-3xl font-semibold text-bcp-gold-bright md:text-4xl">
          {t("h1")}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">
          {t("lead")}
        </p>
      </SectionHeroBand>
      <section className="border-b border-bcp-border bg-bcp-surface py-16">
        <SectionImageSplit
          src={splitVisual.src}
          alt={splitVisual.alt}
          imageSide="start"
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
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3 lg:px-6">
          {keys.map((key) => (
            <div
              key={key}
              className="rounded-2xl border border-bcp-border bg-bcp-surface/50 p-6"
            >
              <h2 className="text-sm font-semibold text-bcp-anthracite">
                {t(`blocks.${key}.title`)}
              </h2>
              <p className="mt-3 text-sm text-bcp-muted">
                {t(`blocks.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-6xl px-4 text-center lg:px-6">
          <Link
            href="/contact"
            className="inline-flex rounded-full bg-bcp-anthracite px-6 py-3 text-sm font-semibold text-white"
          >
            {t("cta")}
          </Link>
        </div>
      </section>
    </>
  );
}
