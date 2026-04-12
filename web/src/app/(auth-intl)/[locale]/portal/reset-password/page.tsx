"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { parseAppLocale } from "@/lib/appLocale";

/**
 * Supabase emails use this localized URL. Tokens may live in the hash; forward them to
 * `/portal/reset-password` where `ResetPasswordForm` establishes the session.
 */
export default function LocalizedResetPasswordGateway() {
  const params = useParams();
  const locale = parseAppLocale(typeof params?.locale === "string" ? params.locale : null);

  useEffect(() => {
    const u = new URL(window.location.href);
    const target = new URL(`${window.location.origin}/portal/reset-password`);
    target.searchParams.set("locale", locale);
    u.searchParams.forEach((value, key) => {
      if (key !== "locale") target.searchParams.set(key, value);
    });
    target.hash = u.hash;
    window.location.replace(target.toString());
  }, [locale]);

  return (
    <p className="mx-auto max-w-md p-8 text-center text-sm text-bcp-muted">Redirection…</p>
  );
}
