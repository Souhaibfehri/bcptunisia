import { cookies } from "next/headers";
import { createClient as createSSRClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import {
  assertServiceRoleConfigured,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/utils/supabase/config";

/** Server Components / Route Handlers — uses cookies() + `@/utils/supabase/server`. */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

/**
 * Admin-only client that bypasses RLS via the service_role key.
 * MUST only be called behind requireFullAdmin() guards.
 * Never import in portal / client-facing code.
 */
export function createServiceRoleClient() {
  assertServiceRoleConfigured();
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  return createSSRClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
