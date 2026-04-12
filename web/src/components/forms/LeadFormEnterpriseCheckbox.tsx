"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { PUBLIC_LEAD_RECAPTCHA_ACTION } from "@/lib/recaptcha/publicLeadRecaptchaAction";

const SCRIPT_MARKER = "recaptcha/enterprise.js";

function enterpriseScriptPresent(): boolean {
  return !!document.querySelector(`script[src*="${SCRIPT_MARKER}"]`);
}

type Props = {
  siteKey: string;
  /** Filled after the widget renders (used with `grecaptcha.enterprise.getResponse`). */
  widgetIdRef: MutableRefObject<number | null>;
  className?: string;
};

/**
 * Visible reCAPTCHA Enterprise checkbox (not score-only execute).
 * Script: `https://www.google.com/recaptcha/enterprise.js` (no `?render=`).
 */
export function LeadFormEnterpriseCheckbox({ siteKey, widgetIdRef, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    widgetIdRef.current = null;

    function renderIntoContainer() {
      const el = containerRef.current;
      if (!el || cancelled) return;
      const g = window.grecaptcha?.enterprise;
      if (!g?.render) return;
      while (el.firstChild) el.removeChild(el.firstChild);
      const id = g.render(el, {
        sitekey: siteKey,
        action: PUBLIC_LEAD_RECAPTCHA_ACTION,
      });
      widgetIdRef.current = id;
    }

    function bootstrap() {
      window.grecaptcha?.enterprise?.ready(() => {
        if (cancelled) return;
        renderIntoContainer();
      });
    }

    if (enterpriseScriptPresent()) {
      bootstrap();
      return () => {
        cancelled = true;
        widgetIdRef.current = null;
      };
    }

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/enterprise.js";
    script.async = true;
    script.defer = true;
    script.onload = () => bootstrap();
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      widgetIdRef.current = null;
    };
  }, [siteKey, widgetIdRef]);

  return <div className={className} ref={containerRef} />;
}

export function readLeadCheckboxToken(widgetId: number | null): string {
  if (widgetId == null || typeof window === "undefined") return "";
  return window.grecaptcha?.enterprise?.getResponse?.(widgetId)?.trim() ?? "";
}

export function resetLeadCheckbox(widgetId: number | null): void {
  if (widgetId == null || typeof window === "undefined") return;
  window.grecaptcha?.enterprise?.reset?.(widgetId);
}
