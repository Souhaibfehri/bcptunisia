import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/auth";
import { PayslipDownloadButton } from "@/components/hr/PayslipDownloadButton";

export const dynamic = "force-dynamic";

export default async function WorkspacePayslipsPage() {
  const profile = await getProfile();
  const supabase = await createServerSupabaseClient();
  if (!profile) return null;

  const { data: empRow } = await supabase.from("hr_employees").select("id").eq("user_id", profile.id).maybeSingle();
  const { data: rows } = empRow
    ? await supabase
        .from("hr_payslips")
        .select("id, period_start, period_end, filename, created_at")
        .eq("employee_id", empRow.id)
        .order("period_start", { ascending: false })
    : { data: [] };

  return (
    <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-bcp-anthracite">Mes bulletins</h2>
      <p className="mt-1 text-sm text-bcp-muted">Téléchargement sécurisé (lien signé, durée limitée).</p>
      <ul className="mt-6 divide-y divide-bcp-border">
        {(rows ?? []).map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
            <span>
              {p.period_start} → {p.period_end} · {p.filename}
            </span>
            <PayslipDownloadButton payslipId={p.id} />
          </li>
        ))}
      </ul>
      {(rows ?? []).length === 0 && <p className="mt-6 text-sm text-bcp-muted">Aucun bulletin disponible.</p>}
    </section>
  );
}
