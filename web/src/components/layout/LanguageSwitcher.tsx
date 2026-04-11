"use client";

import { useLocale } from "next-intl";
import { routing, usePathname, useRouter } from "@/i18n/routing";

const labels: Record<string, string> = {
  fr: "FR",
  en: "EN",
  ar: "AR",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-bcp-border bg-white/80 p-1 shadow-sm backdrop-blur"
      role="navigation"
      aria-label="Language"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition ${
            locale === loc
              ? "bg-bcp-anthracite text-white"
              : "text-bcp-muted hover:text-bcp-anthracite"
          }`}
        >
          {labels[loc]}
        </button>
      ))}
    </div>
  );
}
