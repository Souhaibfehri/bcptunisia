import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminFlashBanner } from "@/components/admin/AdminFlashBanner";
import { decideLeaveRequest } from "@/app/admin/(hr)/hr/actions";
import { embedOne } from "@/lib/supabase/embed";
import { hrEmployeeDisplayName } from "@/lib/hr/display";

export const dynamic = "force-dynamic";

type SearchProps = {
  searchParams: Promise<{ error?: string; success?: string; view?: string }>;
};

export default async function HrLeaveQueuePage({ searchParams }: SearchProps) {
  const sp = await searchParams;
  const supabase = await createServerSupabaseClient();
  const view = sp.view ?? "pending";

  const startMonth = new Date();
  startMonth.setDate(1);
  const monthStart = startMonth.toISOString().slice(0, 10);

  const [{ count: cPending }, { count: cApprovedMonth }, { count: cRejectedMonth }] = await Promise.all([
    supabase.from("hr_leave_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("hr_leave_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .gte("starts_on", monthStart),
    supabase
      .from("hr_leave_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "rejected")
      .gte("created_at", monthStart),
  ]);

  let listQuery = supabase
    .from("hr_leave_requests")
    .select(
      "id, starts_on, ends_on, reason, status, created_at, employee_id, hr_employees ( user_id, first_name, last_name, profiles!hr_employees_user_id_fkey ( display_name, email ) ), hr_leave_types ( label )",
    )
    .order("created_at", { ascending: view === "pending" });

  if (view === "pending") listQuery = listQuery.eq("status", "pending");
  else if (view === "approved") listQuery = listQuery.eq("status", "approved");
  else if (view === "rejected") listQuery = listQuery.eq("status", "rejected");
  listQuery = listQuery.limit(view === "pending" ? 100 : 80);

  const { data: rows } = await listQuery;

  const tab = (id: string, label: string) => {
    const active = view === id;
    return (
      <Link
        href={id === "pending" ? "/admin/hr/leave" : `/admin/hr/leave?view=${id}`}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
          active ? "bg-bcp-navy text-white" : "text-bcp-muted hover:bg-white hover:text-bcp-anthracite"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-bcp-anthracite">Congés</h1>
          <p className="mt-1 text-sm text-bcp-muted">File RH, filtres et vue calendrier.</p>
        </div>
        <Link
          href="/admin/hr/leave/calendar"
          className="rounded-full border border-bcp-border bg-white px-4 py-2 text-xs font-semibold text-bcp-anthracite shadow-sm hover:bg-bcp-surface"
        >
          Calendrier mensuel →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-bcp-border bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-amber-700">{cPending ?? 0}</p>
          <p className="text-xs text-bcp-muted">En attente</p>
        </div>
        <div className="rounded-xl border border-bcp-border bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-emerald-700">{cApprovedMonth ?? 0}</p>
          <p className="text-xs text-bcp-muted">Approuvés (mois en cours)</p>
        </div>
        <div className="rounded-xl border border-bcp-border bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-red-600">{cRejectedMonth ?? 0}</p>
          <p className="text-xs text-bcp-muted">Refusés (mois en cours)</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-bcp-border bg-bcp-cream/30 p-2">
        {tab("pending", "À traiter")}
        {tab("approved", "Approuvés")}
        {tab("rejected", "Refusés")}
        {tab("all", "Tous")}
      </div>

      <AdminFlashBanner error={sp.error} success={sp.success} />

      {(rows ?? []).length === 0 ? (
        <p className="rounded-xl border border-dashed border-bcp-border bg-white px-6 py-10 text-center text-sm text-bcp-muted">
          {view === "pending"
            ? "Aucune demande en attente. Bonne journée côté congés."
            : "Aucune demande dans cette vue."}
        </p>
      ) : (
        <ul className="space-y-4">
          {(rows ?? []).map((r) => {
            const emp = embedOne<{
              user_id: string | null;
              first_name?: string | null;
              last_name?: string | null;
              profiles: unknown;
            }>(r.hr_employees);
            const name = hrEmployeeDisplayName(emp ?? {});
            const lt = embedOne<{ label: string }>(r.hr_leave_types);
            const showActions = r.status === "pending" && view === "pending";
            return (
              <li key={r.id} className="rounded-2xl border border-bcp-border bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-bcp-anthracite">{name}</p>
                    <p className="text-sm text-bcp-muted">
                      {lt?.label} · {r.starts_on} → {r.ends_on}
                    </p>
                    <p className="mt-1 text-xs uppercase text-bcp-muted">{r.status}</p>
                    {r.reason && <p className="mt-2 text-sm text-bcp-anthracite/80">{r.reason}</p>}
                    <Link href={`/admin/hr/employees/${r.employee_id}`} className="mt-2 inline-block text-xs text-bcp-navy hover:underline">
                      Fiche employé
                    </Link>
                  </div>
                  {showActions ? (
                    <div className="flex flex-col gap-2">
                      <form action={decideLeaveRequest} className="flex flex-wrap gap-2">
                        <input type="hidden" name="request_id" value={r.id} />
                        <input type="hidden" name="redirect_to" value="/admin/hr/leave" />
                        <input type="hidden" name="decision" value="approve" />
                        <button type="submit" className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white">
                          Approuver
                        </button>
                      </form>
                      <form action={decideLeaveRequest} className="flex flex-col gap-1">
                        <input type="hidden" name="request_id" value={r.id} />
                        <input type="hidden" name="redirect_to" value="/admin/hr/leave" />
                        <input type="hidden" name="decision" value="reject" />
                        <input name="decision_note" placeholder="Motif du refus" className="rounded-lg border border-bcp-border px-2 py-1 text-xs" />
                        <button type="submit" className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-700">
                          Refuser
                        </button>
                      </form>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
