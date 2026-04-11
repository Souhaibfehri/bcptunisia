import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projectsPage" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projectsPage" });

  return (
    <>
      <Breadcrumbs items={[{ href: "/projects", label: t("h1") }]} />
      <section className="border-b border-bcp-border bg-bcp-surface py-14">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <h1 className="text-3xl font-semibold text-bcp-anthracite">{t("h1")}</h1>
          <p className="mt-4 text-sm text-bcp-muted">{t("lead")}</p>
        </div>
      </section>
      <section className="py-14">
        <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-bcp-border bg-bcp-surface/40 px-6 py-12 text-center text-sm text-bcp-muted">
          {t("placeholder")}
        </div>
      </section>
    </>
  );
}
