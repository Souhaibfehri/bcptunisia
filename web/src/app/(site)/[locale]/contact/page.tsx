import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { getContactPageMerged } from "@/lib/cms/contactResolved";
import { getResolvedSiteSettings } from "@/lib/cms/siteResolved";
import { pickLocale } from "@/lib/localePick";
import { mailHref, telHref } from "@/lib/telMail";
import type { Locale } from "@/content/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LeadForm } from "@/components/forms/LeadForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;
  const t = await getTranslations({ locale, namespace: "contactPage" });
  const forms = await getTranslations({ locale, namespace: "forms" });
  const merged = await getContactPageMerged(loc, (key) => t(key));
  const site = await getResolvedSiteSettings();
  const formOk = pickLocale(site.formSuccessMessage, loc, forms("success"));
  const formErr = pickLocale(site.formErrorMessage, loc, forms("error"));

  return (
    <>
      <Breadcrumbs items={[{ href: "/contact", label: t("h1") }]} />
      <section className="border-b border-bcp-border bg-bcp-surface py-14">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <h1 className="text-3xl font-semibold text-bcp-anthracite">{t("h1")}</h1>
          <p className="mt-4 max-w-2xl text-sm text-bcp-muted">{merged.lead}</p>
        </div>
      </section>
      {merged.pageImageUrl ? (
        <section className="border-b border-bcp-border bg-white py-10">
          <div className="mx-auto max-w-6xl px-4 lg:px-6">
            <div className="relative aspect-[21/9] overflow-hidden rounded-2xl border border-bcp-border">
              <Image
                src={merged.pageImageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 72rem"
              />
            </div>
          </div>
        </section>
      ) : null}
      <section className="py-14">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[1fr_1.2fr] lg:px-6">
          <aside className="rounded-2xl border border-bcp-border bg-bcp-cream/40 p-8">
            <h2 className="text-sm font-semibold text-bcp-anthracite">
              {merged.asideTitle}
            </h2>
            <p className="mt-3 text-sm text-bcp-muted">{merged.asideIntro}</p>
            <div className="mt-6 space-y-2 text-sm text-bcp-anthracite">
              <p className="leading-relaxed">{site.headOfficeAddress}</p>
              <p className="leading-relaxed">{site.workshopAddress}</p>
              <p>
                <a className="font-medium text-bcp-copper hover:underline" href={telHref(site.phoneLandline)}>
                  {site.phoneLandline}
                </a>
              </p>
              <p>
                <a className="font-medium text-bcp-copper hover:underline" href={telHref(site.phoneMobile)}>
                  {site.phoneMobile}
                </a>
              </p>
              <p>
                <a className="font-medium text-bcp-copper hover:underline" href={mailHref(site.emailPrimary)}>
                  {site.emailPrimary}
                </a>
              </p>
              <p>
                <a className="font-medium text-bcp-copper hover:underline" href={mailHref(site.emailSecondary)}>
                  {site.emailSecondary}
                </a>
              </p>
              {site.whatsappUrl ? (
                <p>
                  <a
                    className="font-medium text-bcp-copper hover:underline"
                    href={site.whatsappUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    WhatsApp
                  </a>
                </p>
              ) : null}
              {site.mapUrl ? (
                <p>
                  <a
                    className="font-medium text-bcp-copper hover:underline"
                    href={site.mapUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Google Maps
                  </a>
                </p>
              ) : null}
            </div>
            <p className="mt-6 text-xs text-bcp-muted">{merged.mapHint}</p>
          </aside>
          <div className="rounded-2xl border border-bcp-border bg-white p-8 shadow-sm">
            <LeadForm sourceType="contact_page" successMessage={formOk} errorMessage={formErr} />
          </div>
        </div>
      </section>
    </>
  );
}
