"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { AppLocale } from "@/lib/appLocale";
import { getLocalizedSignupEmailRedirectUrl } from "@/lib/publicSite";
import { describeSupabaseAuthError } from "@/utils/supabase/auth-errors";
import { verifyRecaptchaPreflightOnClient } from "@/lib/recaptcha/clientPreflight";

export function SignupForm({ locale }: { locale: AppLocale }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const captcha = await verifyRecaptchaPreflightOnClient("SIGNUP");
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
      const { error: sErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getLocalizedSignupEmailRedirectUrl(locale),
          data: { full_name: displayName },
        },
      });
      if (sErr) {
        setError(sErr.message);
        return;
      }
      setMessage("Vérifiez votre boîte mail pour confirmer le compte, puis connectez-vous.");
    } catch (err) {
      setError(describeSupabaseAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-bcp-border/90 bg-gradient-to-b from-white to-bcp-cream/25 p-8 shadow-md">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-bcp-muted">
            Nom affiché
          </label>
          <input
            id="name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 bcp-input"
          />
        </div>
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
            Mot de passe (min. 8 caractères)
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 bcp-input"
          />
        </div>
        {error ? (
          <p className="rounded-lg border border-red-200/80 bg-[var(--status-danger-bg)] px-3 py-2 text-sm text-[var(--status-danger-fg)]">{error}</p>
        ) : null}
        {message ? (
          <p className="rounded-lg border border-emerald-200/80 bg-[var(--status-success-bg)] px-3 py-2 text-sm text-[var(--status-success-fg)]">{message}</p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-gold py-3 text-sm font-semibold text-bcp-anthracite shadow-md transition hover:opacity-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bcp-gold focus-visible:ring-offset-2"
        >
          {loading ? "Création…" : "Créer le compte"}
        </button>
      </form>
      <p className="text-center text-xs text-bcp-muted">
        <Link
          href={`/portal/login?locale=${encodeURIComponent(locale)}`}
          className="underline hover:text-bcp-anthracite"
        >
          Déjà un compte ? Se connecter
        </Link>
      </p>
    </div>
  );
}
