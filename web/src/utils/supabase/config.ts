/**
 * Public Supabase URL (no trailing slash).
 */
export function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  return raw.replace(/\/+$/, "");
}

/**
 * Client-side API key for GoTrue + PostgREST.
 *
 * Collects, in order: PUBLISHABLE_KEY, PUBLISHABLE_DEFAULT_KEY, ANON_KEY.
 * If any candidate is a legacy anon JWT (`eyJ…`), it is preferred — best compatibility
 * with `@supabase/supabase-js`. If signup shows "Failed to fetch", add
 * NEXT_PUBLIC_SUPABASE_ANON_KEY from Dashboard → Settings → API.
 */
export function getSupabasePublicKey(): string {
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const publishableDefaultKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const ordered = [publishableKey, publishableDefaultKey, anonKey].filter(Boolean) as string[];

  const jwtKey = ordered.find((k) => k.startsWith("eyJ"));
  if (jwtKey) return jwtKey;
  return ordered[0] ?? "";
}

/** @deprecated use getSupabasePublicKey */
export function getSupabasePublishableKey(): string {
  return getSupabasePublicKey();
}

export function assertSupabaseConfigured(): void {
  const url = getSupabaseUrl();
  const key = getSupabasePublicKey();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and one of: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  if (!url.startsWith("https://")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must use https.");
  }
}

/**
 * Service role JWT for server-only admin API (bypasses RLS). Never expose to the client.
 * Supports legacy and newer Supabase env names.
 */
export function getSupabaseServiceRoleKey(): string {
  const a = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const b = process.env.SUPABASE_SECRET_KEY?.trim();
  const ordered = [a, b].filter(Boolean) as string[];
  const jwtKey = ordered.find((k) => k.startsWith("eyJ"));
  if (jwtKey) return jwtKey;
  return ordered[0] ?? "";
}

export function assertServiceRoleConfigured(): void {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!key) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY");
  }
  if (missing.length > 0) {
    throw new Error(
      `Supabase service client cannot start. Missing or empty: ${missing.join(", ")}. ` +
        `Add a service_role JWT to .env.local (server-only — never NEXT_PUBLIC_*). ` +
        `Use either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY (Dashboard → Settings → API).`,
    );
  }
  if (!url.startsWith("https://")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must use https.");
  }
}
