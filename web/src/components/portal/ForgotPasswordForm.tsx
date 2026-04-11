"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { describeSupabaseAuthError } from "@/utils/supabase/auth-errors";

function getSiteUrl() {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

export function ForgotPasswordForm() {
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
      let supabase;
      try {
        supabase = createBrowserSupabaseClient();
      } catch (cfgErr) {
        setError(describeSupabaseAuthError(cfgErr));
        return;
      }
      const { error: rErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getSiteUrl()}/auth/callback?next=/portal/dashboard`,
      });
      if (rErr) {
        setError(rErr.message);
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
        <Link href="/portal/login" className="underline hover:text-bcp-anthracite">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
