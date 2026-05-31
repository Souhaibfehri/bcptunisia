import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  divisions,
  isValidDivision,
  isValidServiceSlug,
  type DivisionId,
  type ServiceSlug,
} from "@/data/services";
import { divisionPath, subservicePath } from "@/data/nav";
import { getSubservicePage } from "@/content/subservices";
import type { Locale } from "@/content/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { ServiceEndCta } from "@/components/sections/ServiceEndCta";
import { SectionHeroBand } from "@/components/media/SectionHeroBand";
import { divisionToVisualKey } from "@/data/visualPlaceholders";
import { getVisualForPlacement } from "@/lib/cms/visualsResolved";
import { divisionToFormCategory } from "@/lib/serviceCategory";
import { serviceVisuals } from "@/data/serviceVisuals";

export function generateStaticParams() {
  const out: { division: string; slug: string }[] = [];
  for (const d of divisions) {
    for (const slug of d.slugs) {
      out.push({ division: d.id, slug });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; division: string; slug: string }>;
}) {
  const { locale, division, slug } = await params;
  if (!isValidDivision(division) || !isValidServiceSlug(slug)) return {};
  const div = divisions.find((d) => d.id === division);
  if (!div?.slugs.includes(slug as ServiceSlug)) return {};
  const page = getSubservicePage(locale as Locale, slug as ServiceSlug);
  return {
    title: page.metaTitle,
    description: page.metaDescription,
  };
}

export default async function SubservicePage({
  params,
}: {
  params: Promise<{ locale: string; division: string; slug: string }>;
}) {
  const { locale, division, slug } = await params;
  if (!isValidDivision(division) || !isValidServiceSlug(slug)) notFound();
  const div = divisions.find((d) => d.id === division);
  if (!div?.slugs.includes(slug as ServiceSlug)) notFound();

  const id = division as DivisionId;
  const s = slug as ServiceSlug;
  const page = getSubservicePage(locale as Locale, s);
  const nav = await getTranslations({ locale, namespace: "nav" });
  const common = await getTranslations({ locale, namespace: "common" });
  const slugImageSrc = serviceVisuals[s];
  const heroVisual = slugImageSrc
    ? { src: slugImageSrc, alt: page.h1 }
    : await getVisualForPlacement(divisionToVisualKey(id), locale as Locale);

  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/services", label: common("allServices") },
          { href: divisionPath(id), label: nav(`divisions.pillars.${id}.title`) },
          { href: subservicePath(id, s), label: page.h1 },
        ]}
      />
      <SectionHeroBand src={heroVisual.src} alt={heroVisual.alt} priority>
        <p className="text-xs font-semibold uppercase tracking-wider text-bcp-gold-bright">
          {nav(`divisions.pillars.${id}.title`)}
        </p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">{page.h1}</h1>
        <p className="mt-4 max-w-2xl text-sm text-white/80">{page.heroLead}</p>
      </SectionHeroBand>
      <section className="py-14">
        <div className="mx-auto max-w-6xl space-y-10 px-4 lg:px-6">
          <p className="max-w-3xl text-sm leading-relaxed text-bcp-muted">
            {page.intro}
          </p>
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-gold">
                {page.needsTitle}
              </h2>
              <ul className="mt-4 list-disc space-y-2 ps-5 text-sm text-bcp-muted">
                {page.needs.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-gold">
                {page.providesTitle}
              </h2>
              <ul className="mt-4 list-disc space-y-2 ps-5 text-sm text-bcp-muted">
                {page.provides.map((item, i) => (
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
                  className="rounded-xl border border-bcp-border bg-bcp-cream/40 p-4"
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
              {page.sectors.map((sec) => (
                <li
                  key={sec}
                  className="rounded-full border border-bcp-border bg-white px-3 py-1 text-xs"
                >
                  {sec}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href={divisionPath(id)}
            className="inline-block text-sm font-medium text-bcp-copper hover:underline"
          >
            ← {common("backToServices")} ({nav(`divisions.pillars.${id}.title`)})
          </Link>
        </div>
      </section>
      <FaqAccordion
        title={page.faqTitle}
        items={page.faq.map((item, i) => ({
          id: `sub-${division}-${slug}-${i}`,
          q: item.q,
          a: item.a,
        }))}
      />
      <ServiceEndCta defaultServiceCategory={divisionToFormCategory(id)} />
    </>
  );
}
