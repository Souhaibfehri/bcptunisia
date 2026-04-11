import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/auth";
import { submitLeaveRequest, cancelOwnLeaveRequest } from "@/app/employee/(authenticated)/actions";
import { embedOne } from "@/lib/supabase/embed";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/button-variants";

export const dynamic = "force-dynamic";

function leaveRequestBadgeClass(status: string): string {
  if (status === "approved") return "border border-emerald-200/90 bg-[var(--status-success-bg)] text-[var(--status-success-fg)]";
  if (status === "rejected") return "border border-red-200/90 bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]";
  return "border border-bcp-border bg-bcp-surface text-bcp-muted";
}

type Props = { searchParams: Promise<{ error?: string; success?: string }> };

export default async function WorkspaceLeavePage({ searchParams }: Props) {
  const sp = await searchParams;
  const profile = await getProfile();
  const supabase = await createServerSupabaseClient();
  if (!profile) return null;

  const { data: types } = await supabase.from("hr_leave_types").select("id, label").order("sort_order");

  const { data: empRow } = await supabase.from("hr_employees").select("id").eq("user_id", profile.id).maybeSingle();
  const { data: mine } = empRow
    ? await supabase
        .from("hr_leave_requests")
        .select("id, starts_on, ends_on, status, reason, hr_leave_types ( label )")
        .eq("employee_id", empRow.id)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  const { data: myBalances } = empRow
    ? await supabase
        .from("hr_leave_balances")
        .select("year, balance_days, leave_type_id, hr_leave_types ( label )")
        .eq("employee_id", empRow.id)
        .order("year", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-8">
      {sp.error && (
        <p className="rounded-lg border border-red-200/80 bg-[var(--status-danger-bg)] px-4 py-2 text-sm text-[var(--status-danger-fg)]">
          {decodeURIComponent(sp.error)}
        </p>
      )}
      {sp.success && (
        <p className="rounded-lg border border-emerald-200/80 bg-[var(--status-success-bg)] px-4 py-2 text-sm text-[var(--status-success-fg)]">
          Demande enregistrée.
        </p>
      )}

      <Card padding="md">
        <SectionHeader title="Mes soldes" description="Jours disponibles par type de congé." />
        {(myBalances ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-bcp-muted">Aucun solde renseigné pour le moment. Contactez les RH.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {(myBalances ?? []).map((b) => {
              const lt = embedOne<{ label: string }>(b.hr_leave_types);
              return (
                <li
                  key={`${b.leave_type_id}-${b.year}`}
                  className="bcp-card rounded-xl border border-bcp-border bg-gradient-to-br from-white to-bcp-cream/30 px-4 py-3"
                >
                  <p className="text-xs text-bcp-muted">{lt?.label ?? "Congé"}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-bcp-anthracite">{Number(b.balance_days).toFixed(1)}</p>
                  <p className="text-xs text-bcp-muted">jours · {b.year}</p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card padding="md">
        <SectionHeader title="Nouvelle demande" />
        <form action={submitLeaveRequest} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-bcp-anthracite">Type</label>
            <select name="leave_type_id" required className="mt-1 bcp-input">
              <option value="">—</option>
              {(types ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-anthracite">Début</label>
            <input name="starts_on" type="date" required className="mt-1 bcp-input" />
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-anthracite">Fin</label>
            <input name="ends_on" type="date" required className="mt-1 bcp-input" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-bcp-anthracite">Commentaire</label>
            <textarea name="reason" rows={2} className="mt-1 bcp-input min-h-[4rem]" />
          </div>
          <button type="submit" className={buttonClass({ size: "sm", className: "sm:col-span-2 justify-self-start" })}>
            Envoyer
          </button>
        </form>
      </Card>

      <Card padding="md">
        <SectionHeader title="Historique" />
        <ul className="mt-4 divide-y divide-bcp-border">
          {(mine ?? []).map((r) => {
            const lt = embedOne<{ label: string }>(r.hr_leave_types);
            return (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <span className="font-medium text-bcp-anthracite">{lt?.label}</span>
                  <span className="ml-2 text-bcp-muted">
                    {r.starts_on} → {r.ends_on}
                  </span>
                  {r.reason && <p className="mt-1 text-xs text-bcp-muted">{r.reason}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge size="md" className={leaveRequestBadgeClass(r.status)}>
                    {r.status}
                  </Badge>
                  {r.status === "pending" && (
                    <form action={cancelOwnLeaveRequest}>
                      <input type="hidden" name="request_id" value={r.id} />
                      <button type="submit" className={buttonClass({ variant: "ghost", size: "sm", className: "text-red-600 hover:text-red-700" })}>
                        Annuler
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
