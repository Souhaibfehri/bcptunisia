import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/auth";
import { decideLeaveRequest } from "@/app/admin/(hr)/hr/actions";
import { embedOne } from "@/lib/supabase/embed";
import { hrEmployeeDisplayName } from "@/lib/hr/display";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ error?: string; success?: string }> };

export default async function WorkspaceManagerLeavePage({ searchParams }: Props) {
  const sp = await searchParams;
  const profile = await getProfile();
  const supabase = await createServerSupabaseClient();
  if (!profile) return null;

  const { data: pending } = await supabase
    .from("hr_leave_requests")
    .select(
      "id, starts_on, ends_on, reason, employee_id, hr_employees ( user_id, manager_user_id, first_name, last_name, profiles!hr_employees_user_id_fkey ( display_name, email ) ), hr_leave_types ( label )",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const visible = (pending ?? []).filter((r) => {
    const emp = embedOne<{ user_id: string | null; manager_user_id: string | null }>(r.hr_employees);
    return emp?.manager_user_id === profile.id;
  });

  return (
    <div className="space-y-6">
      {sp.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{decodeURIComponent(sp.error)}</p>
      )}
      {sp.success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">Décision enregistrée.</p>
      )}

      <p className="text-sm text-bcp-muted">
        Vous voyez ici les demandes de votre équipe (filtrées par la base : manager direct). Si une demande n&apos;apparaît pas, vérifiez le champ
        manager sur la fiche employé.
      </p>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-bcp-border bg-white px-6 py-10 text-center text-sm text-bcp-muted">
          Aucune demande en attente pour vos collaborateurs.
        </p>
      ) : (
        <ul className="space-y-4">
          {visible.map((r) => {
            const emp = embedOne<{
              user_id: string | null;
              manager_user_id: string | null;
              first_name?: string | null;
              last_name?: string | null;
              profiles: unknown;
            }>(r.hr_employees);
            const name = hrEmployeeDisplayName(emp ?? {});
            const lt = embedOne<{ label: string }>(r.hr_leave_types);
            return (
              <li key={r.id} className="rounded-2xl border border-bcp-border bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-bcp-anthracite">{name}</p>
                    <p className="text-sm text-bcp-muted">
                      {lt?.label} · {r.starts_on} → {r.ends_on}
                    </p>
                    {r.reason && <p className="mt-2 text-sm">{r.reason}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <form action={decideLeaveRequest}>
                      <input type="hidden" name="request_id" value={r.id} />
                      <input type="hidden" name="redirect_to" value="/employee/manager/leave" />
                      <input type="hidden" name="decision" value="approve" />
                      <button type="submit" className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white">
                        Approuver
                      </button>
                    </form>
                    <form action={decideLeaveRequest} className="flex flex-col gap-1">
                      <input type="hidden" name="request_id" value={r.id} />
                      <input type="hidden" name="redirect_to" value="/employee/manager/leave" />
                      <input type="hidden" name="decision" value="reject" />
                      <input name="decision_note" placeholder="Motif" className="rounded-lg border border-bcp-border px-2 py-1 text-xs" />
                      <button type="submit" className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-700">
                        Refuser
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Link href="/employee" className="text-xs text-bcp-navy hover:underline">
        ← Retour espace RH
      </Link>
    </div>
  );
}
