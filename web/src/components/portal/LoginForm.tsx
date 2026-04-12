"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { AppLocale } from "@/lib/appLocale";
import { getOAuthRedirectUrl } from "@/lib/publicSite";
import { describeSupabaseAuthError } from "@/utils/supabase/auth-errors";
import { buttonClass } from "@/components/ui/button-variants";
import { verifyRecaptchaPreflightOnClient } from "@/lib/recaptcha/clientPreflight";

export function LoginForm({ locale }: { locale: AppLocale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/portal/dashboard";
  const passwordResetOk = searchParams.get("success") === "password_reset";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function oauth(provider: "google" | "azure") {
    setError(null);
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: oErr } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getOAuthRedirectUrl(next, locale),
        },
      });
      if (oErr) setError(oErr.message);
    } catch (e) {
      setError(describeSupabaseAuthError(e));
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const captcha = await verifyRecaptchaPreflightOnClient("LOGIN");
      if (!captcha.ok) {
        setError(captcha.message);
        return;
      }
      let supabase;
      try {
        supabase = createBrowserSupabaseClient();
      } catch (cfgErr) {
        setError(describeSupabaseAuthError(cfgErr));
        return;
      }
      const { error: sErr } = await supabase.auth.signInWithPassword({ email, password });
      if (sErr) {
        setError(sErr.message);
        return;
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(describeSupabaseAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-bcp-border/90 bg-gradient-to-b from-white to-bcp-cream/25 p-8 shadow-md">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => oauth("google")}
          className={buttonClass({ variant: "secondary", size: "lg", className: "w-full" })}
        >
          Continuer avec Google
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => oauth("azure")}
          className={buttonClass({ variant: "secondary", size: "lg", className: "w-full" })}
        >
          Continuer avec Microsoft
        </button>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-bcp-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider text-bcp-muted">
          <span className="bg-white px-2">ou e-mail</span>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        {passwordResetOk ? (
          <p className="rounded-lg border border-emerald-200/80 bg-[var(--status-success-bg)] px-3 py-2 text-sm text-[var(--status-success-fg)]">
            Mot de passe mis à jour. Vous pouvez vous connecter.
          </p>
        ) : null}
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-bcp-muted">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 bcp-input"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-bcp-muted">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 bcp-input"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-gold py-3 text-sm font-semibold text-bcp-anthracite shadow-md transition hover:opacity-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bcp-gold focus-visible:ring-offset-2"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <p className="text-center text-xs text-bcp-muted">
        <Link
          href={`/portal/forgot-password?locale=${encodeURIComponent(locale)}`}
          className="underline hover:text-bcp-anthracite"
        >
          Mot de passe oublié
        </Link>
        {" · "}
        <Link
          href={`/portal/signup?locale=${encodeURIComponent(locale)}`}
          className="underline hover:text-bcp-anthracite"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
