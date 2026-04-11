import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile, isPeopleManagerRole } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function EmployeeManagerHubPage() {
  const profile = await getProfile();
  const supabase = await createServerSupabaseClient();
  if (!profile) redirect("/portal/login?next=/employee/manager");

  const { data: emp } = await supabase.from("hr_employees").select("id").eq("user_id", profile.id).maybeSingle();
  if (!emp) redirect("/portal/dashboard");

  const peopleMgr = isPeopleManagerRole(profile.role);
  const { count: reportCount } = await supabase
    .from("hr_employees")
    .select("user_id", { count: "exact", head: true })
    .eq("manager_user_id", profile.id);
  const hasDirectReports = (reportCount ?? 0) > 0;

  const { count: tmCount } = await supabase
    .from("hr_team_members")
    .select("*", { count: "exact", head: true })
    .eq("employee_id", emp.id)
    .eq("role", "manager");
  const teamManager = (tmCount ?? 0) > 0;

  if (!peopleMgr && !hasDirectReports && !teamManager) {
    redirect("/employee");
  }

  const { count: pendingTeamLeave } = await supabase
    .from("hr_leave_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-bcp-anthracite">Espace manager</h1>
        <p className="mt-1 text-sm text-bcp-muted">
          Vue dédiée à la gestion d&apos;équipe : congés des collaborateurs dont vous êtes le manager direct ou le manager
          d&apos;équipe (configuration RH).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/employee/manager/leave"
          className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm transition hover:border-bcp-navy/30"
        >
          <h2 className="text-sm font-semibold text-bcp-anthracite">Congés à traiter</h2>
          <p className="mt-2 text-3xl font-bold text-bcp-navy">{pendingTeamLeave ?? 0}</p>
          <p className="mt-1 text-xs text-bcp-muted">Demandes en attente visibles pour vous (filtrage RLS).</p>
          <span className="mt-3 inline-block text-xs font-semibold text-bcp-gold">Ouvrir →</span>
        </Link>

        <div className="rounded-2xl border border-bcp-border bg-bcp-surface/40 p-6">
          <h2 className="text-sm font-semibold text-bcp-anthracite">Votre périmètre</h2>
          <ul className="mt-3 space-y-2 text-sm text-bcp-muted">
            {hasDirectReports && <li>• Manager direct ({reportCount} collaborateur(s))</li>}
            {teamManager && <li>• Manager d&apos;équipe (équipes RH)</li>}
            {peopleMgr && <li>• Rôle « Manager équipe » sur le compte</li>}
          </ul>
        </div>
      </div>

      <p className="text-xs text-bcp-muted">
        Les équipes et rattachements se configurent dans l&apos;administration RH (menu Équipes).
      </p>
    </div>
  );
}
