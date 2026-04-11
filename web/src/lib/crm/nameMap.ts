import type { SupabaseClient } from "@supabase/supabase-js";

export async function buildProfileNameMap(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<Record<string, string>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return {};
  const { data } = await supabase.from("profiles").select("id, email, display_name").in("id", unique);
  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    const label = row.display_name?.trim() || row.email?.trim() || row.id;
    map[row.id] = label;
  }
  return map;
}
