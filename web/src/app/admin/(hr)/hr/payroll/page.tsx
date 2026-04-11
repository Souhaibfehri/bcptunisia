import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminFlashBanner } from "@/components/admin/AdminFlashBanner";
import { PayslipDownloadButton } from "@/components/hr/PayslipDownloadButton";
import { uploadHrPayslip } from "@/app/admin/(hr)/hr/actions";
import { embedOne } from "@/lib/supabase/embed";
import { hrEmployeeDisplayName } from "@/lib/hr/display";

export const dynamic = "force-dynamic";

type SearchProps = { searchParams: Promise<{ error?: string; success?: string }> };

export default async function HrPayrollPage({ searchParams }: SearchProps) {
  const sp = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: recent } = await supabase
    .from("hr_payslips")
    .select(
      "id, period_start, period_end, filename, created_at, hr_employees ( id, user_id, first_name, last_name, personal_email, profiles!hr_employees_user_id_fkey ( display_name, email ) )",
    )
    .order("created_at", { ascending: false })
    .limit(40);

  const { data: employees } = await supabase
    .from("hr_employees")
    .select("id, user_id, first_name, last_name, personal_email, work_email, profiles!hr_employees_user_id_fkey ( display_name, email )")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-bcp-anthracite">Bulletins de paie</h1>
        <p className="mt-1 text-sm text-bcp-muted">Dépôt sécurisé (bucket privé, par fiche employé).</p>
      </div>

      <AdminFlashBanner error={sp.error} success={sp.success} />

      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Téléverser un bulletin</h2>
        <form action={uploadHrPayslip} encType="multipart/form-data" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="text-xs text-bcp-muted">Employé</label>
            <select name="employee_id" required className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
              <option value="">—</option>
              {(employees ?? []).map((e) => (
                <option key={e.id} value={e.id}>
                  {hrEmployeeDisplayName({
                    first_name: (e as { first_name?: string }).first_name,
                    last_name: (e as { last_name?: string }).last_name,
                    user_id: e.user_id,
                    profiles: e.profiles,
                  })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-bcp-muted">Début période</label>
            <input name="period_start" type="date" required className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-bcp-muted">Fin période</label>
            <input name="period_end" type="date" required className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-bcp-muted">Fichier (PDF recommandé)</label>
            <input name="file" type="file" required className="mt-1 block text-sm" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-full bg-bcp-navy px-5 py-2 text-xs font-semibold text-white">
              Envoyer
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Récent</h2>
        <ul className="mt-4 divide-y divide-bcp-border">
          {(recent ?? []).map((p) => {
            const emp = embedOne<{
              user_id: string | null;
              first_name?: string | null;
              last_name?: string | null;
              personal_email?: string | null;
              profiles: unknown;
            }>(p.hr_employees);
            const name = hrEmployeeDisplayName(emp ?? {});
            return (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <span className="font-medium text-bcp-anthracite">{name}</span>
                  <span className="ml-2 text-bcp-muted">
                    {p.period_start} → {p.period_end} · {p.filename}
                  </span>
                </div>
                <PayslipDownloadButton payslipId={p.id} />
              </li>
            );
          })}
        </ul>
        {(recent ?? []).length === 0 && <p className="text-sm text-bcp-muted">Aucun bulletin.</p>}
      </section>
    </div>
  );
}
