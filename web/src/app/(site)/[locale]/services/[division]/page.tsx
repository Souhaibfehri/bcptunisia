import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  divisions,
  isValidDivision,
  type DivisionId,
} from "@/data/services";
import { divisionPath, subservicePath } from "@/data/nav";
import { getPillarPage } from "@/content/pillars";
import type { Locale } from "@/content/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { ServiceEndCta } from "@/components/sections/ServiceEndCta";
import Image from "next/image";
import { SectionHeroBand } from "@/components/media/SectionHeroBand";
import { divisionToVisualKey } from "@/data/visualPlaceholders";
import { getVisualForPlacement } from "@/lib/cms/visualsResolved";
import { divisionToFormCategory } from "@/lib/serviceCategory";
import { serviceNavLabels } from "@/data/serviceNavLabels";
import type { ServiceSlug } from "@/data/services";

export function generateStaticParams() {
  return divisions.map((d) => ({ division: d.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; division: string }>;
}) {
  const { locale, division } = await params;
  if (!isValidDivision(division)) return {};
  const page = getPillarPage(locale as Locale, division);
  return {
    title: page.metaTitle,
    description: page.metaDescription,
  };
}

export default async function DivisionPage({
  params,
}: {
  params: Promise<{ locale: string; division: string }>;
}) {
  const { locale, division } = await params;
  if (!isValidDivision(division)) notFound();

  const id = division as DivisionId;
  const page = getPillarPage(locale as Locale, id);
  const nav = await getTranslations({ locale, namespace: "nav" });
  const common = await getTranslations({ locale, namespace: "common" });
  const divData = divisions.find((d) => d.id === id)!;
  const heroVisual = await getVisualForPlacement(divisionToVisualKey(id), locale as Locale);
  const sectionVisual = await getVisualForPlacement("services-index", locale as Locale);

  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/services", label: common("allServices") },
          { href: divisionPath(id), label: nav(`divisions.pillars.${id}.title`) },
        ]}
      />
      <SectionHeroBand src={heroVisual.src} alt={heroVisual.alt} priority>
        <h1 className="text-3xl font-semibold md:text-4xl">{page.h1}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">
          {page.heroLead}
        </p>
      </SectionHeroBand>
      <section className="py-14">
        <div className="mx-auto max-w-6xl space-y-10 px-4 lg:px-6">
          <p className="max-w-3xl text-sm leading-relaxed text-bcp-muted">
            {page.intro}
          </p>
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-bcp-border bg-bcp-surface shadow-sm">
            <div className="relative aspect-[2.35/1] w-full">
              <Image
                src={sectionVisual.src}
                alt={sectionVisual.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 56rem"
              />
            </div>
          </div>
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-gold">
                {page.scopeTitle}
              </h2>
              <ul className="mt-4 list-disc space-y-2 ps-5 text-sm text-bcp-muted">
                {page.scopeItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-gold">
                {page.approachTitle}
              </h2>
              <ul className="mt-4 list-disc space-y-2 ps-5 text-sm text-bcp-muted">
                {page.approach.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-gold">
              {page.lifecycleTitle}
            </h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-5">
              {page.lifecycle.map((step, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-bcp-border bg-bcp-surface/50 p-4"
                >
                  <span className="text-xs font-bold text-bcp-copper">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 text-sm font-semibold text-bcp-anthracite">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs text-bcp-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-gold">
              {page.sectorsTitle}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {page.sectors.map((s) => (
                <li
                  key={s}
                  className="rounded-full border border-bcp-border bg-white px-3 py-1 text-xs text-bcp-anthracite"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-bcp-anthracite">
              {nav("divisions.label")}
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {divData.slugs.map((slug) => (
                <li key={slug}>
                  <Link
                    href={subservicePath(id, slug)}
                    className="text-sm text-bcp-copper hover:underline"
                  >
                    →{" "}
                    {
                      serviceNavLabels[slug as ServiceSlug][locale as Locale]
                    }
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <FaqAccordion
        title={page.faqTitle}
        items={page.faq.map((item, i) => ({
          id: `pillar-${id}-${i}`,
          q: item.q,
          a: item.a,
        }))}
      />
      <ServiceEndCta defaultServiceCategory={divisionToFormCategory(id)} />
    </>
  );
}
