import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { assertSupabaseConfigured, getSupabasePublicKey, getSupabaseUrl } from "./config";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export function createClient(cookieStore: CookieStore) {
  assertSupabaseConfigured();
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabasePublicKey();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* setAll from a Server Component — middleware refreshes session */
        }
      },
    },
  });
}
