"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { divisions } from "@/data/services";
import { divisionPath, subservicePath } from "@/data/nav";
import { serviceNavLabels } from "@/data/serviceNavLabels";
import type { Locale } from "@/content/types";

export function MegaMenu() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav.divisions");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-bcp-anthracite hover:text-bcp-copper"
        aria-expanded={open}
      >
        {tNav("items.services")}
        <span className="text-bcp-muted" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div className="absolute start-0 top-full z-50 w-[min(100vw-2rem,58rem)] pt-2">
          <div className="grid gap-0 overflow-hidden rounded-xl border border-bcp-border bg-white shadow-xl md:grid-cols-5">
            {divisions.map((d) => (
              <div
                key={d.id}
                className="border-e border-bcp-border last:border-e-0 md:border-b-0 md:border-e"
              >
                <Link
                  href={divisionPath(d.id)}
                  className="block bg-bcp-surface px-4 py-3.5 text-sm font-semibold leading-snug text-bcp-anthracite hover:bg-bcp-anthracite hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  {t(`pillars.${d.id}.title`)}
                </Link>
                <ul className="max-h-72 space-y-0.5 overflow-y-auto px-2 py-3">
                  {d.slugs.map((slug) => (
                    <li key={slug}>
                      <Link
                        href={subservicePath(d.id, slug)}
                        className="block rounded-md px-2.5 py-2 text-[0.8125rem] leading-snug text-bcp-muted hover:bg-bcp-cream hover:text-bcp-anthracite"
                        onClick={() => setOpen(false)}
                      >
                        {serviceNavLabels[slug][locale]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
