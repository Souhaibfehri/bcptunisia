import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export async function Breadcrumbs({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const t = await getTranslations("breadcrumbs");

  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto max-w-6xl px-4 py-4 text-xs text-bcp-muted lg:px-6"
    >
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:text-bcp-anthracite">
            {t("home")}
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.href} className="flex items-center gap-2">
            <span aria-hidden>/</span>
            <Link href={item.href} className="hover:text-bcp-anthracite">
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
