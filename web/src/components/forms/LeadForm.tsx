"use client";

import {
  LeadFormEnterpriseCheckbox,
  readLeadCheckboxToken,
  resetLeadCheckbox,
} from "@/components/forms/LeadFormEnterpriseCheckbox";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

type Props = {
  compact?: boolean;
  defaultServiceCategory?: string;
  /** Override default success copy (e.g. from CMS) */
  successMessage?: string;
  /** Override default error copy (e.g. from CMS) */
  errorMessage?: string;
  /** Identifies origin for CRM (e.g. homepage, contact_page, service_cta) */
  sourceType?: string;
};

function flattenFieldMessages(issues: Record<string, string[] | undefined> | undefined): string[] {
  if (!issues) return [];
  const out: string[] = [];
  for (const v of Object.values(issues)) {
    if (v?.length) out.push(...v);
  }
  return out;
}

export function LeadForm({
  compact,
  defaultServiceCategory,
  successMessage,
  errorMessage,
  sourceType = "website_contact",
}: Props) {
  const t = useTranslations("forms");
  const locale = useLocale();
  const pathname = usePathname();
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [serverHint, setServerHint] = useState<string | null>(null);
  const captchaWidgetIdRef = useRef<number | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setFieldErrors([]);
    setServerHint(null);
    if (fd.get("website")) {
      setStatus("ok");
      return;
    }
    setStatus("sending");
    try {
      const recaptchaToken = siteKey ? readLeadCheckboxToken(captchaWidgetIdRef.current) : "";
      if (siteKey && !recaptchaToken) {
        setStatus("err");
        setServerHint(t("captchaRequired"));
        return;
      }
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          name: fd.get("name"),
          company: fd.get("company"),
          phone: fd.get("phone"),
          email: fd.get("email"),
          sector: fd.get("sector"),
          needType: fd.get("needType"),
          serviceCategory: fd.get("serviceCategory"),
          message: fd.get("message"),
          website: fd.get("website") ?? "",
          sourceType,
          sourceForm: "LeadForm",
          sourcePage: pathname || undefined,
          recaptchaToken: recaptchaToken || undefined,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        issues?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
        error?: string;
        message?: string;
      };

      if (res.status === 403 && json.error === "recaptcha") {
        setStatus("err");
        setServerHint(t("recaptchaFailed"));
        return;
      }
      if (res.status === 429) {
        setStatus("err");
        setServerHint(json.message ?? "Merci d'attendre avant un nouvel envoi.");
        return;
      }
      if (res.status === 503) {
        setStatus("err");
        setServerHint("Service temporairement indisponible. Réessayez plus tard ou contactez-nous par téléphone.");
        return;
      }
      if (!res.ok || !json.ok) {
        setStatus("err");
        const flat = flattenFieldMessages(json.issues?.fieldErrors);
        if (flat.length) setFieldErrors(flat);
        else setServerHint(errorMessage ?? t("error"));
        return;
      }
      setStatus("ok");
      form.reset();
      resetLeadCheckbox(captchaWidgetIdRef.current);
    } catch {
      setStatus("err");
      setServerHint(errorMessage ?? t("error"));
    }
  }

  const input = "bcp-input";
  const label = "mb-1 block text-xs font-semibold text-bcp-anthracite";

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {status === "ok" && (
        <p className="rounded-lg border border-emerald-200/80 bg-[var(--status-success-bg)] px-3 py-2 text-sm text-[var(--status-success-fg)]">
          {successMessage ?? t("success")}
        </p>
      )}
      {status === "err" && (
        <div className="rounded-lg border border-red-200/80 bg-[var(--status-danger-bg)] px-3 py-2 text-sm text-[var(--status-danger-fg)]">
          {serverHint ? <p>{serverHint}</p> : null}
          {fieldErrors.length > 0 ? (
            <ul className="mt-1 list-inside list-disc">
              {fieldErrors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          ) : !serverHint ? (
            <p>{errorMessage ?? t("error")}</p>
          ) : null}
        </div>
      )}
      <div className={compact ? "grid gap-3 sm:grid-cols-2" : "grid gap-3 md:grid-cols-2"}>
        <div>
          <label className={label} htmlFor="lf-name">
            {t("name")} *
          </label>
          <input id="lf-name" name="name" required className={input} />
        </div>
        <div>
          <label className={label} htmlFor="lf-company">
            {t("company")} *
          </label>
          <input id="lf-company" name="company" required className={input} />
        </div>
        <div>
          <label className={label} htmlFor="lf-phone">
            {t("phone")} *
          </label>
          <input id="lf-phone" name="phone" type="tel" required className={input} />
        </div>
        <div>
          <label className={label} htmlFor="lf-email">
            {t("email")} *
          </label>
          <input id="lf-email" name="email" type="email" required className={input} />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className={label} htmlFor="lf-sector">
            {t("sector")} *
          </label>
          <select id="lf-sector" name="sector" required className={input} defaultValue="">
            <option value="" disabled>
              {t("choose")}
            </option>
            <option value="industry">{t("sectors.industry")}</option>
            <option value="tertiary">{t("sectors.tertiary")}</option>
            <option value="health">{t("sectors.health")}</option>
            <option value="retail">{t("sectors.retail")}</option>
            <option value="logistics">{t("sectors.logistics")}</option>
            <option value="public">{t("sectors.public")}</option>
            <option value="other">{t("sectors.other")}</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="lf-need">
            {t("needType")} *
          </label>
          <select id="lf-need" name="needType" required className={input}>
            <option value="quote">{t("needTypes.quote")}</option>
            <option value="expert">{t("needTypes.expert")}</option>
            <option value="maintenance">{t("needTypes.maintenance")}</option>
            <option value="audit">{t("needTypes.audit")}</option>
            <option value="other">{t("needTypes.other")}</option>
          </select>
        </div>
      </div>
      <div>
        <label className={label} htmlFor="lf-cat">
          {t("serviceCategory")} *
        </label>
        <select
          id="lf-cat"
          name="serviceCategory"
          required
          className={input}
          defaultValue={defaultServiceCategory ?? ""}
        >
          <option value="" disabled>
            {t("choose")}
          </option>
          <option value="fire">{t("serviceCategories.fire")}</option>
          <option value="security">{t("serviceCategories.security")}</option>
          <option value="fluids">{t("serviceCategories.fluids")}</option>
          <option value="electrical">{t("serviceCategories.electrical")}</option>
          <option value="engineering">{t("serviceCategories.engineering")}</option>
          <option value="maintenance">{t("serviceCategories.maintenance")}</option>
          <option value="other">{t("serviceCategories.other")}</option>
        </select>
      </div>
      <div>
        <label className={label} htmlFor="lf-msg">
          {t("message")} *
        </label>
        <textarea id="lf-msg" name="message" required rows={compact ? 3 : 5} className={input} />
      </div>
      {siteKey ? (
        <div className="flex justify-center py-1">
          <LeadFormEnterpriseCheckbox siteKey={siteKey} widgetIdRef={captchaWidgetIdRef} />
        </div>
      ) : null}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-bcp-navy py-3 text-sm font-semibold text-white shadow-md transition hover:bg-bcp-slate disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bcp-gold focus-visible:ring-offset-2"
      >
        {status === "sending" ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
