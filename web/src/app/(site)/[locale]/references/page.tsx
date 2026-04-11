import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { Locale } from "@/content/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ReferenceMarquee } from "@/components/references/ReferenceMarquee";
import { getReferenceLogos } from "@/lib/getReferenceLogos";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "referencesPage" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ReferencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "referencesPage" });
  const logos = await getReferenceLogos(locale as Locale);

  return (
    <>
      <Breadcrumbs items={[{ href: "/references", label: t("h1") }]} />
      <section className="border-b border-bcp-border bg-bcp-surface py-14">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <h1 className="text-3xl font-semibold text-bcp-anthracite">{t("h1")}</h1>
          <p className="mt-4 max-w-2xl text-sm text-bcp-muted">{t("lead")}</p>
          <p className="mt-4 text-xs text-bcp-muted/80">{t("note")}</p>
        </div>
      </section>
      <section className="border-b border-bcp-border bg-bcp-navy py-10 text-white">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <ReferenceMarquee logos={logos} ariaLabel={t("marqueeAria")} />
        </div>
      </section>
      <section className="py-14">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:px-6">
          {logos.map((logo) => (
            <li
              key={logo.id}
              className="flex flex-col items-center justify-center rounded-xl border border-bcp-border bg-white p-4 shadow-sm"
            >
              <Image
                src={logo.src}
                alt=""
                width={160}
                height={64}
                className="max-h-12 w-auto max-w-full object-contain opacity-90 grayscale transition hover:grayscale-0"
              />
              <span className="mt-3 text-center text-xs font-medium text-bcp-anthracite">
                {logo.name}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
