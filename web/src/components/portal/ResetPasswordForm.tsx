"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { describeSupabaseAuthError } from "@/utils/supabase/auth-errors";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase.auth.getSession();
        setHasSession(!!data.session);
      } catch {
        setHasSession(false);
      } finally {
        setSessionChecked(true);
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: uErr } = await supabase.auth.updateUser({ password });
      if (uErr) {
        setError(uErr.message);
        return;
      }
      await supabase.auth.signOut();
      router.push("/portal/login?success=password_reset");
      router.refresh();
    } catch (err) {
      setError(describeSupabaseAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  if (!sessionChecked) {
    return (
      <p className="mx-auto max-w-md text-center text-sm text-bcp-muted">Chargement…</p>
    );
  }

  if (!hasSession) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-bcp-border bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-bcp-muted">
          Ce lien est invalide ou a expiré. Demandez un nouveau lien de réinitialisation.
        </p>
        <Link href="/portal/forgot-password" className="text-sm font-medium text-bcp-anthracite underline">
          Mot de passe oublié
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-bcp-border bg-white p-8 shadow-sm">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-bcp-muted">
            Nouveau mot de passe (min. 8 caractères)
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm ring-bcp-focus"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-xs font-medium text-bcp-muted">
            Confirmer le mot de passe
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm ring-bcp-focus"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-gold py-3 text-sm font-semibold text-bcp-anthracite shadow disabled:opacity-50"
        >
          {loading ? "Enregistrement…" : "Enregistrer le mot de passe"}
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
