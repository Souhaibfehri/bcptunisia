"use client";

import { useEffect, useRef, type MutableRefObject } from "react";

/** Dedicated tag so we never rely on `enterprise.js?render=` (portal/score) for the checkbox widget. */
const LEAD_CHECKBOX_SCRIPT_ID = "recaptcha-enterprise-lead-checkbox";

function safeEnterpriseScriptForCheckbox(): HTMLScriptElement | null {
  const nodes = document.querySelectorAll<HTMLScriptElement>('script[src*="recaptcha/enterprise.js"]');
  for (const s of nodes) {
    if (!s.src.includes("render=")) return s;
  }
  return null;
}

type Props = {
  siteKey: string;
  /** Filled after the widget renders (used with `grecaptcha.enterprise.getResponse`). */
  widgetIdRef: MutableRefObject<number | null>;
  className?: string;
};

/**
 * Visible reCAPTCHA Enterprise checkbox.
 * Loads `https://www.google.com/recaptcha/enterprise.js` without `?render=` so it does not
 * conflict with portal flows that load `enterprise.js?render=SITE_KEY` for score/execute.
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
      });
      widgetIdRef.current = id;
    }

    function bootstrap() {
      window.grecaptcha?.enterprise?.ready(() => {
        if (cancelled) return;
        renderIntoContainer();
      });
    }

    if (safeEnterpriseScriptForCheckbox()) {
      bootstrap();
    } else if (document.getElementById(LEAD_CHECKBOX_SCRIPT_ID)) {
      bootstrap();
    } else {
      const script = document.createElement("script");
      script.id = LEAD_CHECKBOX_SCRIPT_ID;
      script.src = "https://www.google.com/recaptcha/enterprise.js";
      script.async = true;
      script.defer = true;
      script.onload = () => bootstrap();
      document.head.appendChild(script);
    }

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
