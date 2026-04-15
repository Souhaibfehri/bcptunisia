import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DeleteHrTeamButton } from "@/components/hr/DeleteHrTeamButton";
import { embedOne } from "@/lib/supabase/embed";
import { hrEmployeeDisplayName } from "@/lib/hr/display";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ teamId: string }> };

export default async function HrTeamDetailPage({ params }: PageProps) {
  const { teamId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: team } = await supabase.from("hr_teams").select("id, name, description, created_at").eq("id", teamId).maybeSingle();
  if (!team) notFound();

  const { data: members } = await supabase
    .from("hr_team_members")
    .select("employee_id, role, hr_employees ( id, user_id, first_name, last_name, profiles!hr_employees_user_id_fkey ( display_name, email ) )")
    .eq("team_id", teamId);

  const employeeIds = (members ?? []).map((m) => m.employee_id).filter(Boolean);

  const { count: pendingLeave } =
    employeeIds.length > 0
      ? await supabase
          .from("hr_leave_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending")
          .in("employee_id", employeeIds)
      : { count: 0 };

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/hr/teams" className="text-xs font-medium text-bcp-gold">
          ← Équipes
        </Link>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold text-bcp-anthracite">{team.name}</h1>
            {team.description ? <p className="mt-1 text-sm text-bcp-muted">{team.description}</p> : null}
          </div>
          <DeleteHrTeamButton
            variant="detail"
            teamId={team.id}
            teamName={team.name}
            memberCount={(members ?? []).length}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-bcp-border bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-bcp-anthracite">{(members ?? []).length}</p>
          <p className="text-xs text-bcp-muted">membres</p>
        </div>
        <div className="rounded-xl border border-bcp-border bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-bcp-anthracite">{pendingLeave ?? 0}</p>
          <p className="text-xs text-bcp-muted">congés en attente (équipe)</p>
        </div>
        <div className="rounded-xl border border-bcp-border bg-white p-4 shadow-sm">
          <p className="text-xs text-bcp-muted">Créée le</p>
          <p className="mt-1 font-medium text-bcp-anthracite">{team.created_at?.slice(0, 10) ?? "—"}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Membres</h2>
        <ul className="mt-4 divide-y divide-bcp-border">
          {(members ?? []).map((m) => {
            const emp = embedOne<{
              id: string;
              user_id: string | null;
              first_name?: string | null;
              last_name?: string | null;
              profiles: unknown;
            }>(m.hr_employees);
            if (!emp?.id) return null;
            const name = hrEmployeeDisplayName(emp);
            return (
              <li key={m.employee_id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <Link href={`/admin/hr/employees/${emp.id}`} className="font-medium text-bcp-navy hover:underline">
                  {name}
                </Link>
                <span className="text-xs text-bcp-muted">{m.role === "manager" ? "Manager" : "Membre"}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
