import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export default async function NotFound() {
  const t = await getTranslations("common");

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-bcp-anthracite">
        {t("notFoundTitle")}
      </h1>
      <p className="mt-4 text-sm text-bcp-muted">{t("notFoundBody")}</p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-bcp-anthracite px-6 py-3 text-sm font-semibold text-white"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
