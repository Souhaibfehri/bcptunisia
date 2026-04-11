import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import type { Locale } from "@/content/types";
import { divisions } from "@/data/services";
import { divisionPath } from "@/data/nav";
import { LeadForm } from "@/components/forms/LeadForm";
import { ReferenceMarquee } from "@/components/references/ReferenceMarquee";
import { getHomePageMerged } from "@/lib/cms/homeResolved";
import { getResolvedSiteSettings } from "@/lib/cms/siteResolved";
import { getReferenceLogos } from "@/lib/getReferenceLogos";
import { pickLocale } from "@/lib/localePick";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;
  const t = await getTranslations({ locale, namespace: "home" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const brochure = await getTranslations({ locale, namespace: "brochure" });
  const forms = await getTranslations({ locale, namespace: "forms" });
  const referenceLogos = await getReferenceLogos(loc);
  const homeM = await getHomePageMerged(loc, (key) => t(key));
  const site = await getResolvedSiteSettings();
  const heroImg =
    homeM.heroImageUrl ??
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=2000&q=80";
  const formOk = pickLocale(site.formSuccessMessage, loc, forms("success"));
  const formErr = pickLocale(site.formErrorMessage, loc, forms("error"));

  return (
    <>
      <section className="relative overflow-hidden bg-bcp-navy text-white">
        <Image
          src={heroImg}
          alt=""
          fill
          className="object-cover opacity-40"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bcp-navy/80 via-bcp-navy/90 to-bcp-navy" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24 lg:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bcp-gold-bright">
              {homeM.heroKicker}
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl lg:text-[2.5rem]">
              {homeM.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
              {homeM.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex rounded-full bg-gradient-gold px-6 py-3 text-sm font-semibold text-bcp-anthracite shadow-lg"
              >
                {homeM.heroCtaQuote}
              </Link>
              <Link
                href="/contact"
                className="inline-flex rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                {homeM.heroCtaExpert}
              </Link>
              <Link
                href="/contact"
                className="inline-flex rounded-full border border-bcp-gold/50 px-6 py-3 text-sm font-semibold text-bcp-gold-bright hover:bg-white/5"
              >
                {homeM.heroCtaBrochure}
              </Link>
            </div>
            <p className="mt-6 max-w-md text-xs text-white/50">
              {brochure("body")}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/95 p-6 text-bcp-anthracite shadow-xl backdrop-blur">
            <p className="text-sm font-semibold text-bcp-anthracite">
              {homeM.heroFormTitle}
            </p>
            <div className="mt-4">
              <LeadForm
                compact
                sourceType="homepage"
                successMessage={formOk}
                errorMessage={formErr}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-bcp-border bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <p className="text-center text-sm font-medium text-bcp-muted">
            {homeM.trustTitle}
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-6 text-center text-sm font-semibold text-bcp-anthracite md:gap-10">
            {homeM.trustItems.map((item, i) => (
              <Fragment key={`${item}-${i}`}>
                {i > 0 ? (
                  <li className="text-bcp-border" aria-hidden>
                    |
                  </li>
                ) : null}
                <li>{item}</li>
              </Fragment>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-bcp-surface py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <h2 className="text-2xl font-semibold text-bcp-anthracite md:text-3xl">
            {t("divisions.title")}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-bcp-muted">
            {t("divisions.subtitle")}
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {divisions.map((d) => (
              <Link
                key={d.id}
                href={divisionPath(d.id)}
                className="group flex flex-col rounded-2xl border border-bcp-border bg-white p-6 shadow-sm transition hover:border-bcp-gold/50 hover:shadow-md"
              >
                <span className="text-gradient-gold text-sm font-semibold uppercase tracking-wide">
                  {nav(`divisions.pillars.${d.id}.title`)}
                </span>
                <span className="mt-3 text-sm text-bcp-muted">
                  {d.slugs.length} {locale === "fr" ? "domaines" : locale === "ar" ? "مجالات" : "domains"}
                </span>
                <span className="mt-4 text-sm font-medium text-bcp-anthracite group-hover:text-bcp-copper">
                  {t("divisions.cta")} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 lg:grid lg:grid-cols-2 lg:gap-12 lg:px-6">
          <div>
            <h2 className="text-2xl font-semibold text-bcp-anthracite">
              {t("about.title")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-bcp-muted">
              {t("about.body")}
            </p>
            <Link
              href="/company"
              className="mt-6 inline-flex text-sm font-semibold text-bcp-copper hover:underline"
            >
              {t("about.link")}
            </Link>
          </div>
          <div className="mt-10 rounded-2xl border border-bcp-border bg-bcp-cream/50 p-8 lg:mt-0">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">
              {t("sectors.title")}
            </h3>
            <p className="mt-2 text-sm text-bcp-muted">{t("sectors.subtitle")}</p>
            <ul className="mt-6 grid gap-3 text-sm text-bcp-anthracite sm:grid-cols-2">
              <li>{t("sectors.industry")}</li>
              <li>{t("sectors.tertiary")}</li>
              <li>{t("sectors.retail")}</li>
              <li>{t("sectors.health")}</li>
              <li>{t("sectors.logistics")}</li>
              <li>{t("sectors.infra")}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-bcp-border bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <h2 className="text-2xl font-semibold text-bcp-anthracite">
            {t("method.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-bcp-muted">
            {t("method.subtitle")}
          </p>
          <ol className="mt-10 grid gap-6 md:grid-cols-5">
            {(["audit", "design", "install", "commission", "maintain"] as const).map(
              (key, i) => (
                <li
                  key={key}
                  className="relative rounded-xl border border-bcp-border bg-bcp-surface/60 p-5"
                >
                  <span className="text-xs font-bold text-bcp-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 text-sm font-semibold text-bcp-anthracite">
                    {t(`method.steps.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-bcp-muted">
                    {t(`method.steps.${key}.body`)}
                  </p>
                </li>
              ),
            )}
          </ol>
        </div>
      </section>

      <section className="bg-bcp-navy py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-semibold text-bcp-gold-bright">
                {t("references.title")}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/70">
                {t("references.subtitle")}
              </p>
            </div>
            <Link
              href="/references"
              className="inline-flex rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              {t("references.cta")}
            </Link>
          </div>
          <div className="mt-10">
            <ReferenceMarquee
              logos={referenceLogos}
              ariaLabel={t("references.marqueeAria")}
            />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <h2 className="text-2xl font-semibold text-bcp-anthracite">
            {t("why.title")}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {(["one", "two", "three", "four"] as const).map((key) => (
              <div
                key={key}
                className="bcp-card rounded-2xl border border-bcp-border bg-bcp-card p-6 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-bcp-anthracite">
                  {t(`why.items.${key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-bcp-muted">
                  {t(`why.items.${key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-bcp-border bg-bcp-surface py-16">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <h2 className="text-2xl font-semibold text-bcp-anthracite">
            {homeM.finalCtaTitle}
          </h2>
          <p className="mt-4 text-sm text-bcp-muted">{homeM.finalCtaBody}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex rounded-full bg-bcp-anthracite px-6 py-3 text-sm font-semibold text-white"
            >
              {homeM.finalCtaPrimary}
            </Link>
            <Link
              href="/contact"
              className="inline-flex rounded-full border border-bcp-border bg-white px-6 py-3 text-sm font-semibold text-bcp-anthracite"
            >
              {homeM.finalCtaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
