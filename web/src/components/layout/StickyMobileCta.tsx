"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function StickyMobileCta() {
  const t = useTranslations("stickyCta");

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 p-3 md:hidden">
      <div className="pointer-events-auto mx-auto flex max-w-lg gap-2 rounded-2xl border border-bcp-border bg-white/95 p-2 shadow-lg backdrop-blur">
        <Link
          href="/contact"
          className="flex-1 rounded-xl bg-bcp-anthracite py-3 text-center text-xs font-semibold text-white"
        >
          {t("quote")}
        </Link>
        <Link
          href="/contact"
          className="flex-1 rounded-xl border border-bcp-border py-3 text-center text-xs font-semibold text-bcp-anthracite"
        >
          {t("expert")}
        </Link>
      </div>
    </div>
  );
}
