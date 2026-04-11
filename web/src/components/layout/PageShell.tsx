import type { Locale } from "@/content/types";
import { getNavigationSettingsResolved } from "@/lib/cms/siteResolved";
import { pickLocale } from "@/lib/localePick";
import { Footer } from "./Footer";
import { Header } from "./Header";

export async function PageShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const nav = await getNavigationSettingsResolved();
  const loc = locale as Locale;
  const ctaRaw = nav.ctaQuote ? pickLocale(nav.ctaQuote, loc, "") : "";
  const ctaQuoteOverride = ctaRaw.trim() ? ctaRaw : null;

  return (
    <>
      <Header
        showNewsInNav={nav.showNewsInNav}
        ctaQuoteOverride={ctaQuoteOverride}
      />
      <main className="flex-1 bg-bcp-page pb-24 md:pb-0">{children}</main>
      <Footer />
    </>
  );
}
