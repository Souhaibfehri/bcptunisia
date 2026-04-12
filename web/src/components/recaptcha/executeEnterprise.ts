"use client";

import type { RecaptchaAction } from "@/lib/recaptcha/actions";

const SCRIPT_ID = "recaptcha-enterprise-v3";

function getSiteKey(): string {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";
}

let scriptPromise: Promise<void> | null = null;

function loadEnterpriseScript(siteKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.grecaptcha?.enterprise) return Promise.resolve();
  if (document.getElementById(SCRIPT_ID)) {
    return scriptPromise ?? Promise.resolve();
  }
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.async = true;
    s.src = `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(siteKey)}`;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("recaptcha_script_load_failed"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Runs Enterprise score challenge in the browser. Returns null if site key is unset or execution fails.
 */
export async function executeRecaptchaEnterprise(action: RecaptchaAction): Promise<string | null> {
  const siteKey = getSiteKey();
  if (!siteKey) return null;

  try {
    await loadEnterpriseScript(siteKey);
    await new Promise<void>((resolve) => {
      window.grecaptcha?.enterprise?.ready(() => resolve());
    });
    const token = await window.grecaptcha!.enterprise!.execute(siteKey, { action });
    return token || null;
  } catch {
    return null;
  }
}
