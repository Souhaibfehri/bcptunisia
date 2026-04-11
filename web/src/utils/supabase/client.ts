import { createBrowserClient } from "@supabase/ssr";
import { assertSupabaseConfigured, getSupabasePublicKey, getSupabaseUrl } from "./config";

export function createClient() {
  assertSupabaseConfigured();
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabasePublicKey();

  return createBrowserClient(supabaseUrl, supabaseKey, {
    // Avoid a stale singleton in dev after changing .env.local without noticing.
    isSingleton: process.env.NODE_ENV === "production",
  });
}
