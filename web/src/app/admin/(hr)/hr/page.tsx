import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { embedOne } from "@/lib/supabase/embed";
import { hrEmployeeDisplayName } from "@/lib/hr/display";

export const dynamic = "force-dynamic";

export default async function AdminHrDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const [
    { count: headcount },
    { count: activeCount },
    { count: pendingLeave },
    { count: assetsOut },
    { count: noPortal },
    { count: docsExpiring },
  ] = await Promise.all([
    supabase.from("hr_employees").select("id", { count: "exact", head: true }),
    supabase.from("hr_employees").select("id", { count: "exact", head: true }).eq("employment_status", "active"),
    supabase.from("hr_leave_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("hr_asset_assignments").select("id", { count: "exact", head: true }).is("returned_at", null),
    supabase
      .from("hr_employees")
      .select("id", { count: "exact", head: true })
      .or("portal_status.is.null,portal_status.neq.active"),
    (() => {
      const in30 = new Date();
      in30.setDate(in30.getDate() + 30);
      return supabase
        .from("hr_employee_documents")
        .select("id", { count: "exact", head: true })
        .not("expires_on", "is", null)
        .lte("expires_on", in30.toISOString().slice(0, 10))
        .gte("expires_on", new Date().toISOString().slice(0, 10));
    })(),
  ]);

  const { data: byDept } = await supabase
    .from("hr_employees")
    .select("department_id, hr_departments ( name )")
    .not("department_id", "is", null);

  const deptCounts = new Map<string, number>();
  for (const r of byDept ?? []) {
    const d = embedOne<{ name: string }>(r.hr_departments);
    const k = d?.name ?? "—";
    deptCounts.set(k, (deptCounts.get(k) ?? 0) + 1);
  }
  const deptTop = [...deptCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const { data: recentLeave } = await supabase
    .from("hr_leave_requests")
    .select(
      "id, starts_on, ends_on, status, employee_id, hr_employees ( user_id, first_name, last_name, profiles!hr_employees_user_id_fkey ( display_name, email ) ), hr_leave_types ( label )",
    )
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: recentHires } = await supabase
    .from("hr_employees")
    .select("id, hire_date, first_name, last_name, user_id, job_title, profiles!hr_employees_user_id_fkey ( display_name, email )")
    .not("hire_date", "is", null)
    .order("hire_date", { ascending: false })
    .limit(6);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-bcp-border/70 bg-gradient-to-br from-white via-bcp-cream/20 to-bcp-navy/[0.05] p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-bcp-navy">Tableau de bord RH</h1>
        <p className="mt-1 max-w-2xl text-sm text-bcp-muted">
          Vue synthétique : effectifs, congés, matériel et documents — repérez les priorités en un coup d&apos;œil.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { n: headcount ?? 0, l: "Effectif total", h: "/admin/hr/employees", a: "border-l-slate-400" },
          { n: activeCount ?? 0, l: "Actifs", h: "/admin/hr/employees?employment_status=active", a: "border-l-emerald-500" },
          { n: pendingLeave ?? 0, l: "Congés à traiter", h: "/admin/hr/leave", a: "border-l-amber-500" },
          { n: assetsOut ?? 0, l: "Matériel sorti", h: "/admin/hr/assets", a: "border-l-violet-500" },
          { n: noPortal ?? 0, l: "Sans portail actif", h: "/admin/hr/employees?no_active_portal=1", a: "border-l-sky-500" },
          { n: docsExpiring ?? 0, l: "Docs exp. 30j", h: "/admin/hr/documents?tab=hr", a: "border-l-bcp-gold" },
        ].map((k) => (
          <Link
            key={k.l}
            href={k.h}
            className={`rounded-xl border border-bcp-border/90 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md border-l-4 ${k.a}`}
          >
            <p className="text-2xl font-bold text-bcp-navy">{k.n}</p>
            <p className="text-xs font-medium text-bcp-muted">{k.l}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-bcp-border/80 bg-white p-6 shadow-sm ring-1 ring-bcp-navy/[0.03]">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Effectif par service</h2>
          {deptTop.length === 0 ? (
            <p className="mt-4 text-sm text-bcp-muted">Aucune répartition (services non renseignés).</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {deptTop.map(([name, c]) => (
                <li key={name} className="flex justify-between text-sm">
                  <span className="text-bcp-anthracite">{name}</span>
                  <span className="font-medium text-bcp-muted">{c}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-bcp-border/80 bg-white p-6 shadow-sm ring-1 ring-bcp-gold/10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Embauches récentes</h2>
          <ul className="mt-4 space-y-2">
            {(recentHires ?? []).map((e) => (
              <li key={e.id} className="flex justify-between text-sm">
                <Link href={`/admin/hr/employees/${e.id}`} className="font-medium text-bcp-navy hover:underline">
                  {hrEmployeeDisplayName({
                    first_name: (e as { first_name?: string }).first_name,
                    last_name: (e as { last_name?: string }).last_name,
                    user_id: e.user_id,
                    profiles: e.profiles,
                  })}
                </Link>
                <span className="text-xs text-bcp-muted">{e.hire_date}</span>
              </li>
            ))}
          </ul>
          {(recentHires ?? []).length === 0 && <p className="mt-2 text-sm text-bcp-muted">Aucune date d&apos;embauche saisie.</p>}
        </section>
      </div>

      <section className="rounded-2xl border border-bcp-border/80 bg-gradient-to-br from-white to-sky-50/40 p-6 shadow-sm ring-1 ring-sky-100/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-navy/70">Congés récents</h2>
          <Link href="/admin/hr/leave" className="text-xs font-semibold text-bcp-navy hover:underline">
            File RH →
          </Link>
        </div>
        {(recentLeave ?? []).length === 0 ? (
          <p className="mt-4 text-sm text-bcp-muted">Aucune demande récente.</p>
        ) : (
          <ul className="mt-4 divide-y divide-bcp-border">
            {(recentLeave ?? []).map((r) => {
              const emp = embedOne<{
                user_id: string | null;
                first_name?: string | null;
                last_name?: string | null;
                profiles: unknown;
              }>(r.hr_employees);
              const lt = embedOne<{ label: string }>(r.hr_leave_types);
              const name = hrEmployeeDisplayName(emp ?? {});
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <div>
                    <span className="font-medium text-bcp-anthracite">{name}</span>
                    <span className="ml-2 text-bcp-muted">
                      {lt?.label} · {r.starts_on} → {r.ends_on}
                    </span>
                  </div>
                  <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold capitalize text-sky-900 ring-1 ring-sky-200/80">
                    {r.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
