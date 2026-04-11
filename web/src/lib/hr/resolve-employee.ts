import type { SupabaseClient } from "@supabase/supabase-js";

export async function getEmployeeIdForProfile(
  supabase: SupabaseClient,
  profileId: string,
): Promise<string | null> {
  const { data } = await supabase.from("hr_employees").select("id").eq("user_id", profileId).maybeSingle();
  return data?.id ?? null;
}

/** Resolve employee UUID from form: `employee_id`, else `profile_user_id` or `user_id` → lookup. */
export async function resolveEmployeeIdFromForm(
  supabase: SupabaseClient,
  formData: FormData,
): Promise<string | null> {
  const employeeId = String(formData.get("employee_id") ?? "").trim();
  if (employeeId) return employeeId;
  const profileId =
    String(formData.get("profile_user_id") ?? "").trim() || String(formData.get("user_id") ?? "").trim();
  if (!profileId) return null;
  return getEmployeeIdForProfile(supabase, profileId);
}
