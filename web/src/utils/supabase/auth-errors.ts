/** Maps low-level network errors from the browser `fetch` to actionable copy. */
export function describeSupabaseAuthError(err: unknown): string {
  if (err instanceof Error) {
    const m = err.message;
    if (
      m === "Failed to fetch" ||
      m.includes("NetworkError") ||
      m.includes("Load failed") ||
      m.includes("Network request failed")
    ) {
      return [
        "Connexion à Supabase impossible.",
        "Vérifiez : URL du projet (NEXT_PUBLIC_SUPABASE_URL), projet non suspendu, réseau/VPN.",
        "Si vous utilisez une clé sb_publishable, ajoutez aussi NEXT_PUBLIC_SUPABASE_ANON_KEY (JWT eyJ… depuis le tableau API Supabase).",
        "Redémarrez npm run dev après modification de .env.local.",
      ].join(" ");
    }
    return m;
  }
  return "Erreur inconnue";
}
