"use client";

import { useState } from "react";
import Link from "next/link";
import type { AppLocale } from "@/lib/appLocale";
import { executeRecaptchaEnterprise } from "@/components/recaptcha/executeEnterprise";
import { describeSupabaseAuthError } from "@/utils/supabase/auth-errors";

export function ForgotPasswordForm({ locale }: { locale: AppLocale }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";
      const recaptchaToken = siteKey ? await executeRecaptchaEnterprise("RESET_PASSWORD_REQUEST") : "";
      if (siteKey && !recaptchaToken) {
        setError("Vérification de sécurité échouée. Réessayez.");
        return;
      }
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, recaptchaToken: recaptchaToken || undefined }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(
          data?.error === "config"
            ? "Configuration serveur incomplète."
            : data?.error === "recaptcha"
              ? "Vérification de sécurité échouée. Réessayez."
              : "Impossible d’envoyer la demande. Réessayez.",
        );
        return;
      }
      setMessage("Si un compte existe pour cet e-mail, un lien de réinitialisation a été envoyé.");
    } catch (err) {
      setError(describeSupabaseAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-bcp-border bg-white p-8 shadow-sm">
      <form onSubmit={onSubmit} className="space-y-4">
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
            className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm ring-bcp-focus"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-gold py-3 text-sm font-semibold text-bcp-anthracite shadow disabled:opacity-50"
        >
          {loading ? "Envoi…" : "Envoyer le lien"}
        </button>
      </form>
      <p className="text-center text-xs text-bcp-muted">
        <Link
          href={`/portal/login?locale=${encodeURIComponent(locale)}`}
          className="underline hover:text-bcp-anthracite"
        >
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
