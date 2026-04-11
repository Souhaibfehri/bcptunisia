import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { LeadForm } from "@/components/forms/LeadForm";

type Props = {
  defaultServiceCategory?: string;
};

export async function ServiceEndCta({ defaultServiceCategory }: Props) {
  const t = await getTranslations("servicePage");

  return (
    <section className="border-t border-bcp-border bg-bcp-navy py-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2 lg:px-6">
        <div>
          <h2 className="text-2xl font-semibold text-bcp-gold-bright">
            {t("ctaTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            {t("ctaBody")}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/contact"
              className="inline-flex justify-center rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-bcp-anthracite"
            >
              {t("ctaQuote")}
            </Link>
            <Link
              href="/contact"
              className="inline-flex justify-center rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white"
            >
              {t("ctaVisit")}
            </Link>
            <Link
              href="/maintenance"
              className="inline-flex justify-center rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white"
            >
              {t("ctaMaintenance")}
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white p-6 text-bcp-anthracite shadow-lg">
          <LeadForm defaultServiceCategory={defaultServiceCategory} sourceType="service_cta" />
        </div>
      </div>
    </section>
  );
}
