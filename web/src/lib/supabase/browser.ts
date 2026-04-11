import { createClient } from "@/utils/supabase/client";

/** Client Components — thin alias for `@/utils/supabase/client`. */
export function createBrowserSupabaseClient() {
  return createClient();
}
