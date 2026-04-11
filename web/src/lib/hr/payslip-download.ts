"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

const BUCKET = "hr-private";

export async function getPayslipSignedUrl(payslipId: string): Promise<{ url?: string; error?: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const { data: row, error: qErr } = await supabase.from("hr_payslips").select("storage_path").eq("id", payslipId).single();
  if (qErr || !row) return { error: "Bulletin introuvable" };

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(row.storage_path, 120);
  if (error) return { error: error.message };
  return { url: data.signedUrl };
}
