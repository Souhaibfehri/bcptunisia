import Link from "next/link";
import { assignProjectMemberByEmail, removeProjectMember, updateProjectMemberPermission } from "@/app/admin/actions";
import { memberRoleLabel } from "@/lib/status";

type Member = {
  user_id: string;
  role: string;
  profile: {
    display_name: string | null;
    email: string | null;
    role: string;
  } | null;
};

export function TeamSection({
  projectId,
  members,
  hrEmployeeUserIds,
  showHrDeepLinks,
  permissionByUser,
  canEditPermissions,
}: {
  projectId: string;
  members: Member[];
  /** Users who have an `hr_employees` row; used when `showHrDeepLinks` is true. */
  hrEmployeeUserIds?: string[];
  showHrDeepLinks?: boolean;
  permissionByUser?: Record<string, { view_invoices?: boolean; view_budget?: boolean }>;
  canEditPermissions?: boolean;
}) {
  const internal = members.filter(
    (m) => m.role === "project_manager" || m.role === "team_member",
  );
  const clientContacts = members.filter(
    (m) => m.role === "client_contact" || m.role === "member",
  );
  const observers = members.filter((m) => m.role === "observer");

  const roleBadge: Record<string, string> = {
    project_manager: "bg-blue-50 text-blue-700",
    team_member: "bg-amber-50 text-amber-700",
    client_contact: "bg-bcp-surface text-bcp-muted",
    member: "bg-bcp-surface text-bcp-muted",
    observer: "bg-zinc-100 text-zinc-500",
  };

  const hrSet = hrEmployeeUserIds ? new Set(hrEmployeeUserIds) : null;

  function MemberRow({ m }: { m: Member }) {
    const showRh =
      showHrDeepLinks && hrSet?.has(m.user_id) && (m.role === "project_manager" || m.role === "team_member");
    const perm = permissionByUser?.[m.user_id];
    const redirectTo = `/admin/projects/${projectId}`;
    return (
      <li className="space-y-2 rounded-lg bg-bcp-surface/60 px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/admin/users/${m.user_id}`} className="text-sm font-medium text-bcp-anthracite hover:text-bcp-navy">
              {m.profile?.display_name || m.profile?.email || "—"}
            </Link>
            {showRh ? (
              <Link
                href={`/admin/hr/employees/${m.user_id}`}
                className="rounded bg-bcp-gold/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-bcp-anthracite hover:bg-bcp-gold/30"
                title="Fiche RH"
              >
                RH
              </Link>
            ) : null}
            {m.profile?.email && <span className="text-xs text-bcp-muted">{m.profile.email}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge[m.role] ?? roleBadge.member}`}>
              {memberRoleLabel(m.role)}
            </span>
            <form action={removeProjectMember}>
              <input type="hidden" name="project_id" value={projectId} />
              <input type="hidden" name="user_id" value={m.user_id} />
              <button type="submit" className="text-xs text-red-500 hover:text-red-700">
                ✕
              </button>
            </form>
          </div>
        </div>
        {canEditPermissions ? (
          <form action={updateProjectMemberPermission} className="flex flex-wrap items-end gap-2 border-t border-bcp-border/50 pt-2 text-xs">
            <input type="hidden" name="project_id" value={projectId} />
            <input type="hidden" name="user_id" value={m.user_id} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <label className="flex items-center gap-1 text-bcp-muted">
              Factures
              <select name="view_invoices" defaultValue={perm?.view_invoices !== false ? "1" : "0"} className="rounded border border-bcp-border px-1 py-0.5">
                <option value="1">Oui</option>
                <option value="0">Non</option>
              </select>
            </label>
            <label className="flex items-center gap-1 text-bcp-muted">
              Budget
              <select name="view_budget" defaultValue={perm?.view_budget ? "1" : "0"} className="rounded border border-bcp-border px-1 py-0.5">
                <option value="1">Oui</option>
                <option value="0">Non</option>
              </select>
            </label>
            <button type="submit" className="rounded-full bg-bcp-navy/90 px-2 py-1 text-[10px] font-semibold text-white">
              OK
            </button>
          </form>
        ) : null}
      </li>
    );
  }

  return (
    <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">
        Équipe projet ({members.length})
      </h2>

      {internal.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-bcp-muted">Équipe interne</p>
          <ul className="mt-2 space-y-2">
            {internal.map((m) => <MemberRow key={m.user_id} m={m} />)}
          </ul>
        </div>
      )}

      {clientContacts.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-bcp-muted">Contacts client</p>
          <ul className="mt-2 space-y-2">
            {clientContacts.map((m) => <MemberRow key={m.user_id} m={m} />)}
          </ul>
        </div>
      )}

      {observers.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-bcp-muted">Observateurs</p>
          <ul className="mt-2 space-y-2">
            {observers.map((m) => <MemberRow key={m.user_id} m={m} />)}
          </ul>
        </div>
      )}

      {members.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-bcp-border bg-bcp-surface/30 px-4 py-6 text-center">
          <p className="text-sm text-bcp-muted">Aucun membre assigné à ce projet.</p>
        </div>
      )}

      <div className="mt-6 border-t border-bcp-border pt-4">
        <p className="text-xs font-medium text-bcp-muted">Ajouter un membre</p>
        <form action={assignProjectMemberByEmail} className="mt-2 flex flex-wrap items-end gap-2">
          <input type="hidden" name="project_id" value={projectId} />
          <input
            name="email"
            type="email"
            required
            placeholder="email@exemple.com"
            className="min-w-[180px] flex-1 rounded-lg border border-bcp-border px-3 py-2 text-sm"
          />
          <select
            name="member_role"
            className="rounded-lg border border-bcp-border px-2 py-2 text-sm"
            defaultValue="client_contact"
          >
            <option value="project_manager">Chef de projet</option>
            <option value="team_member">Équipe interne</option>
            <option value="client_contact">Contact client</option>
            <option value="observer">Observateur</option>
          </select>
          <button
            type="submit"
            className="rounded-full bg-bcp-navy px-4 py-2 text-xs font-semibold text-white"
          >
            Ajouter
          </button>
        </form>
      </div>
    </section>
  );
}
