import { routing } from "@/i18n/routing";

export type AppLocale = (typeof routing.locales)[number];

export function parseAppLocale(raw: string | null | undefined): AppLocale {
  const v = (raw ?? "").trim().toLowerCase();
  if (v === "fr" || v === "en" || v === "ar") return v;
  return routing.defaultLocale;
}
