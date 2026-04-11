import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { PageShell } from "@/components/layout/PageShell";
import { StickyMobileCta } from "@/components/layout/StickyMobileCta";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<string, string> = {
    fr: "BCP Tunisia — BE CLOSE PROTECTION",
    en: "BCP Tunisia — BE CLOSE PROTECTION",
    ar: "BCP Tunisia — BE CLOSE PROTECTION",
  };
  const desc: Record<string, string> = {
    fr: "Partenaire technique pour environnements industriels et tertiaires : étude, installation, mise en service et maintenance.",
    en: "Technical partner for industrial and tertiary environments: design, installation, commissioning, and maintenance.",
    ar: "شريك تقني للبيئات الصناعية والخدمية: دراسة، تركيب، تشغيل وصيانة.",
  };
  return {
    title: {
      default: titles[locale] ?? titles.fr,
      template: "%s | BCP Tunisia",
    },
    description: desc[locale] ?? desc.fr,
    metadataBase: new URL("https://www.bcptunisia.com"),
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_FR" : locale === "ar" ? "ar_TN" : "en_US",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "fr" | "en" | "ar")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var l=${JSON.stringify(locale)};document.documentElement.lang=l;document.documentElement.dir=l==="ar"?"rtl":"ltr";})();`,
        }}
      />
      <NextIntlClientProvider locale={locale} messages={messages}>
        <PageShell locale={locale}>{children}</PageShell>
        <StickyMobileCta />
      </NextIntlClientProvider>
    </>
  );
}
