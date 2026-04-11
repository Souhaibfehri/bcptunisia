import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PayslipDownloadButton } from "@/components/hr/PayslipDownloadButton";
import { embedOne } from "@/lib/supabase/embed";
import { hrEmployeeDisplayName } from "@/lib/hr/display";

export const dynamic = "force-dynamic";

type SearchProps = { searchParams: Promise<{ tab?: string }> };

export default async function HrDocumentsCenterPage({ searchParams }: SearchProps) {
  const sp = await searchParams;
  const tab = sp.tab === "payroll" ? "payroll" : "hr";

  const supabase = await createServerSupabaseClient();

  const { data: payslips } = await supabase
    .from("hr_payslips")
    .select(
      "id, period_start, period_end, filename, created_at, hr_employees ( id, user_id, first_name, last_name, profiles!hr_employees_user_id_fkey ( display_name, email ) )",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: hrDocs } = await supabase
    .from("hr_employee_documents")
    .select(
      "id, category, filename, created_at, visibility, expires_on, employee_id, hr_employees ( id, user_id, first_name, last_name, profiles!hr_employees_user_id_fkey ( display_name, email ) )",
    )
    .order("created_at", { ascending: false })
    .limit(80);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-bcp-anthracite">Centre documentaire RH</h1>
        <p className="mt-1 text-sm text-bcp-muted">Bulletins de paie et documents administratifs par employé.</p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-bcp-border bg-bcp-cream/30 p-2">
        <Link
          href="/admin/hr/documents?tab=hr"
          className={`rounded-full px-4 py-2 text-xs font-semibold ${
            tab === "hr" ? "bg-bcp-navy text-white" : "text-bcp-muted hover:bg-white"
          }`}
        >
          Documents RH
        </Link>
        <Link
          href="/admin/hr/documents?tab=payroll"
          className={`rounded-full px-4 py-2 text-xs font-semibold ${
            tab === "payroll" ? "bg-bcp-navy text-white" : "text-bcp-muted hover:bg-white"
          }`}
        >
          Bulletins
        </Link>
        <Link
          href="/admin/hr/payroll"
          className="ml-auto rounded-full border border-bcp-border bg-white px-4 py-2 text-xs font-semibold text-bcp-anthracite hover:bg-bcp-surface"
        >
          Téléverser un bulletin →
        </Link>
      </div>

      {tab === "payroll" ? (
        <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Bulletins récents</h2>
          <ul className="mt-4 divide-y divide-bcp-border">
            {(payslips ?? []).map((p) => {
              const emp = embedOne<{
                id: string;
                user_id: string | null;
                first_name?: string | null;
                last_name?: string | null;
                profiles: unknown;
              }>(p.hr_employees);
              const who = hrEmployeeDisplayName(emp ?? {});
              return (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <Link href={emp?.id ? `/admin/hr/employees/${emp.id}?tab=payslips` : "#"} className="font-medium text-bcp-navy hover:underline">
                      {who}
                    </Link>
                    <p className="text-xs text-bcp-muted">
                      {p.period_start} → {p.period_end} · {p.filename}
                    </p>
                  </div>
                  <PayslipDownloadButton payslipId={p.id} />
                </li>
              );
            })}
          </ul>
          {(payslips ?? []).length === 0 && <p className="text-sm text-bcp-muted">Aucun bulletin.</p>}
        </section>
      ) : (
        <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Documents par employé</h2>
          <p className="mt-1 text-xs text-bcp-muted">
            Les dépôts se font depuis chaque fiche (onglet Documents). Ici : vue transversale récente.
          </p>
          <ul className="mt-4 divide-y divide-bcp-border">
            {(hrDocs ?? []).map((d) => {
              const emp = embedOne<{
                id: string;
                user_id: string | null;
                first_name?: string | null;
                last_name?: string | null;
                profiles: unknown;
              }>(d.hr_employees);
              const who = hrEmployeeDisplayName(emp ?? {});
              return (
                <li key={d.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                  <div>
                    <Link href={emp?.id ? `/admin/hr/employees/${emp.id}?tab=documents` : "#"} className="font-medium text-bcp-navy hover:underline">
                      {who}
                    </Link>
                    <p className="text-xs text-bcp-muted">
                      {d.filename} · {d.category || "Sans catégorie"} · {d.visibility}
                      {d.expires_on ? ` · exp. ${d.expires_on}` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-bcp-muted">{d.created_at?.slice(0, 10)}</span>
                </li>
              );
            })}
          </ul>
          {(hrDocs ?? []).length === 0 && <p className="text-sm text-bcp-muted">Aucun document enregistré.</p>}
        </section>
      )}
    </div>
  );
}
