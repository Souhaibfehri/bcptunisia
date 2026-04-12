import type { ReactNode } from "react";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Minimal shell: localized auth/portal email entrypoints must not pull the full marketing layout. */
export default function AuthIntlGroupLayout({ children }: { children: ReactNode }) {
  return children;
}
