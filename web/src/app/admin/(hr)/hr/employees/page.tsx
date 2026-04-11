import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminFlashBanner } from "@/components/admin/AdminFlashBanner";
import { memberRoleLabel } from "@/lib/status";
import { createHrDepartment, upsertHrEmployee } from "@/app/admin/(hr)/hr/actions";
import { embedOne } from "@/lib/supabase/embed";
import { hrEmployeeDisplayName, PORTAL_STATUS_LABEL } from "@/lib/hr/display";

export const dynamic = "force-dynamic";

type SearchProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
    q?: string;
    department_id?: string;
    team_id?: string;
    manager_user_id?: string;
    employment_status?: string;
    portal_status?: string;
    contract_type?: string;
    exited?: string;
    no_active_portal?: string;
  }>;
};

const STATUS_LABEL: Record<string, string> = {
  active: "Actif",
  on_leave: "En congé",
  probation: "Période d'essai",
  suspended: "Suspendu",
  terminated: "Sorti",
};

/** SQL treats NULL != 'active' as unknown, so plain .neq excludes NULL portal_status. */
function applyNotActivePortalFilter<T extends { or: (s: string) => T }>(q: T): T {
  return q.or("portal_status.is.null,portal_status.neq.active");
}

export default async function HrEmployeesDirectoryPage({ searchParams }: SearchProps) {
  const sp = await searchParams;
  const supabase = await createServerSupabaseClient();

  const [
    { count: totalCount },
    { count: activeCount },
    { count: probationCount },
    { count: leaveCount },
    { count: exitedCount },
    { count: noPortalCount },
  ] = await Promise.all([
    supabase.from("hr_employees").select("id", { count: "exact", head: true }),
    supabase.from("hr_employees").select("id", { count: "exact", head: true }).eq("employment_status", "active"),
    supabase.from("hr_employees").select("id", { count: "exact", head: true }).eq("employment_status", "probation"),
    supabase.from("hr_employees").select("id", { count: "exact", head: true }).eq("employment_status", "on_leave"),
    supabase
      .from("hr_employees")
      .select("id", { count: "exact", head: true })
      .in("employment_status", ["terminated", "suspended"]),
    applyNotActivePortalFilter(supabase.from("hr_employees").select("id", { count: "exact", head: true })),
  ]);

  /** List: scalar columns only — no embedded FKs (avoids inner-join / RLS dropping rows without user_id or department). */
  let listQuery = supabase
    .from("hr_employees")
    .select(
      "id, user_id, department_id, employee_number, employment_status, employment_type, contract_type, job_title, hire_date, work_email, personal_email, first_name, last_name, portal_status, manager_user_id, created_at",
    )
    .order("created_at", { ascending: false });

  const q = (sp.q ?? "").trim();
  if (q) {
    const esc = q.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
    listQuery = listQuery.or(
      `first_name.ilike.%${esc}%,last_name.ilike.%${esc}%,work_email.ilike.%${esc}%,personal_email.ilike.%${esc}%,employee_number.ilike.%${esc}%`,
    );
  }
  if (sp.department_id) listQuery = listQuery.eq("department_id", sp.department_id);
  if (sp.manager_user_id) listQuery = listQuery.eq("manager_user_id", sp.manager_user_id);
  if (sp.employment_status) listQuery = listQuery.eq("employment_status", sp.employment_status);
  if (sp.portal_status === "none") {
    listQuery = listQuery.or("portal_status.is.null,portal_status.eq.none");
  } else if (sp.portal_status) {
    listQuery = listQuery.eq("portal_status", sp.portal_status);
  }
  if (sp.contract_type) listQuery = listQuery.ilike("contract_type", `%${sp.contract_type}%`);
  if (sp.exited === "1") listQuery = listQuery.in("employment_status", ["terminated", "suspended"]);
  if (sp.no_active_portal === "1") listQuery = applyNotActivePortalFilter(listQuery);

  if (sp.team_id) {
    const { data: memberRows } = await supabase.from("hr_team_members").select("employee_id").eq("team_id", sp.team_id);
    const ids = (memberRows ?? []).map((r) => r.employee_id).filter(Boolean);
    if (ids.length === 0) {
      listQuery = listQuery.eq("id", "00000000-0000-0000-0000-000000000000");
    } else {
      listQuery = listQuery.in("id", ids);
    }
  }

  const { data: employeesRaw } = await listQuery;

  const userIds = [...new Set((employeesRaw ?? []).map((e) => e.user_id).filter((id): id is string => Boolean(id)))];
  const { data: profilesRows } =
    userIds.length > 0
      ? await supabase.from("profiles").select("id, email, display_name, role").in("id", userIds)
      : { data: [] as { id: string; email: string | null; display_name: string | null; role: string }[] };

  const profileById = new Map((profilesRows ?? []).map((p) => [p.id, p]));

  const employees = (employeesRaw ?? []).map((e) => ({
    ...e,
    profiles: e.user_id ? profileById.get(e.user_id) ?? null : null,
  }));

  const { data: memberships } = await supabase
    .from("hr_team_members")
    .select("employee_id, hr_teams ( id, name )");

  const teamByEmployee = new Map<string, string>();
  for (const m of memberships ?? []) {
    const t = embedOne<{ id: string; name: string }>(m.hr_teams);
    if (t?.name && m.employee_id) teamByEmployee.set(m.employee_id, t.name);
  }

  const { data: existingIds } = await supabase.from("hr_employees").select("user_id");
  const taken = new Set(
    (existingIds ?? []).map((r) => r.user_id).filter((uid): uid is string => uid != null),
  );

  const { data: candidateProfiles } = await supabase
    .from("profiles")
    .select("id, email, display_name, role")
    .neq("role", "client")
    .order("display_name", { ascending: true });

  const candidates = (candidateProfiles ?? []).filter((p) => !taken.has(p.id));

  const { data: departments } = await supabase.from("hr_departments").select("id, name").order("name");
  const deptNameById = new Map((departments ?? []).map((d) => [d.id, d.name]));

  const { data: teams } = await supabase.from("hr_teams").select("id, name").order("name");

  const { data: managers } = await supabase
    .from("hr_employees")
    .select("user_id, profiles!hr_employees_user_id_fkey ( display_name, email )")
    .not("user_id", "is", null);

  const managerLabel = (uid: string | null) => {
    if (!uid) return "—";
    const m = (managers ?? []).find((x) => x.user_id === uid);
    const pr = m ? embedOne<{ display_name: string | null; email: string | null }>(m.profiles) : null;
    return pr?.display_name || pr?.email || uid.slice(0, 8) + "…";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-bcp-anthracite">Effectifs</h1>
          <p className="mt-1 text-sm text-bcp-muted">Annuaire des employés — fiches avec ou sans accès portail.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/hr/employees/new"
            className="rounded-full bg-bcp-navy px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-95"
          >
            Ajouter un employé
          </Link>
          <Link
            href="/admin/hr/employees?no_active_portal=1"
            className="rounded-full border border-bcp-border bg-white px-4 py-2 text-xs font-semibold text-bcp-anthracite hover:bg-bcp-surface"
          >
            Créer accès portail
          </Link>
        </div>
      </div>

      <AdminFlashBanner error={sp.error} success={sp.success} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {[
          { label: "Total", value: totalCount ?? 0, href: "/admin/hr/employees" },
          { label: "Actifs", value: activeCount ?? 0, href: "/admin/hr/employees?employment_status=active" },
          { label: "Essai", value: probationCount ?? 0, href: "/admin/hr/employees?employment_status=probation" },
          { label: "En congé", value: leaveCount ?? 0, href: "/admin/hr/employees?employment_status=on_leave" },
          { label: "Sortis / susp.", value: exitedCount ?? 0, href: "/admin/hr/employees?exited=1" },
          { label: "Sans accès actif", value: noPortalCount ?? 0, href: "/admin/hr/employees?no_active_portal=1" },
        ].map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className="rounded-xl border border-bcp-border bg-white p-4 shadow-sm transition hover:border-bcp-navy/30"
          >
            <p className="text-2xl font-bold text-bcp-anthracite">{k.value}</p>
            <p className="text-xs text-bcp-muted">{k.label}</p>
          </Link>
        ))}
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-bcp-border bg-white p-4 shadow-sm" method="get">
        <div className="min-w-[10rem] flex-1">
          <label className="text-xs font-medium text-bcp-muted">Recherche</label>
          <input name="q" defaultValue={q} placeholder="Nom, e-mail, matricule…" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-bcp-muted">Service</label>
          <select name="department_id" defaultValue={sp.department_id ?? ""} className="mt-1 block rounded-lg border border-bcp-border px-2 py-2 text-sm">
            <option value="">Tous</option>
            {(departments ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-bcp-muted">Équipe</label>
          <select name="team_id" defaultValue={sp.team_id ?? ""} className="mt-1 block rounded-lg border border-bcp-border px-2 py-2 text-sm">
            <option value="">Toutes</option>
            {(teams ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-bcp-muted">Manager</label>
          <select name="manager_user_id" defaultValue={sp.manager_user_id ?? ""} className="mt-1 block max-w-[10rem] rounded-lg border border-bcp-border px-2 py-2 text-sm">
            <option value="">Tous</option>
            {(managers ?? [])
              .filter((m): m is typeof m & { user_id: string } => Boolean(m.user_id))
              .map((m) => {
                const pr = embedOne<{ display_name: string | null; email: string | null }>(m.profiles);
                return (
                  <option key={m.user_id} value={m.user_id}>
                    {pr?.display_name || pr?.email || m.user_id}
                  </option>
                );
              })}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-bcp-muted">Statut</label>
          <select name="employment_status" defaultValue={sp.employment_status ?? ""} className="mt-1 block rounded-lg border border-bcp-border px-2 py-2 text-sm">
            <option value="">Tous</option>
            <option value="active">Actif</option>
            <option value="on_leave">En congé</option>
            <option value="probation">Période d&apos;essai</option>
            <option value="suspended">Suspendu</option>
            <option value="terminated">Sorti</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-bcp-muted">Portail</label>
          <select name="portal_status" defaultValue={sp.portal_status ?? ""} className="mt-1 block rounded-lg border border-bcp-border px-2 py-2 text-sm">
            <option value="">Tous</option>
            <option value="none">Aucun accès</option>
            <option value="invite_pending">Invitation en attente</option>
            <option value="active">Actif</option>
            <option value="disabled">Désactivé</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-bcp-muted">Contrat</label>
          <input name="contract_type" defaultValue={sp.contract_type ?? ""} placeholder="CDI…" className="mt-1 w-32 rounded-lg border border-bcp-border px-2 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-full bg-bcp-navy px-4 py-2 text-xs font-semibold text-white">
          Filtrer
        </button>
        <Link href="/admin/hr/employees" className="text-xs font-medium text-bcp-muted hover:text-bcp-navy">
          Réinitialiser
        </Link>
      </form>

      <details className="rounded-2xl border border-bcp-border bg-white p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold text-bcp-anthracite">Lier un profil existant (compte déjà créé)</summary>
        <p className="mt-2 text-xs text-bcp-muted">
          Utilisez cette option uniquement si l&apos;utilisateur a déjà un compte. Sinon, créez d&apos;abord la fiche via « Ajouter un employé », puis activez le portail depuis la fiche.
        </p>
        <form action={upsertHrEmployee} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="text-xs font-medium text-bcp-muted">Profil</label>
            <select name="user_id" required className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm">
              <option value="">— Choisir —</option>
              {candidates.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name || p.email} ({memberRoleLabel(p.role)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">N° matricule</label>
            <input name="employee_number" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Statut</label>
            <select name="employment_status" defaultValue="active" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
              <option value="active">Actif</option>
              <option value="on_leave">En congé</option>
              <option value="probation">Période d&apos;essai</option>
              <option value="suspended">Suspendu</option>
              <option value="terminated">Sorti</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Type</label>
            <select name="employment_type" defaultValue="employee" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
              <option value="employee">Salarié</option>
              <option value="contractor">Prestataire</option>
              <option value="intern">Stagiaire</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Intitulé de poste</label>
            <input name="job_title" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Service</label>
            <select name="department_id" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
              <option value="">—</option>
              {(departments ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Manager</label>
            <select name="manager_user_id" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
              <option value="">—</option>
              {(managers ?? [])
                .filter((m): m is typeof m & { user_id: string } => Boolean(m.user_id))
                .map((m) => {
                  const pr = embedOne<{ display_name: string | null; email: string | null }>(m.profiles);
                  return (
                    <option key={m.user_id} value={m.user_id}>
                      {pr?.display_name || pr?.email || m.user_id}
                    </option>
                  );
                })}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Contrat</label>
            <input name="contract_type" placeholder="CDI, CDD…" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Embauche</label>
            <input name="hire_date" type="date" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Fin</label>
            <input name="end_date" type="date" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">E-mail pro</label>
            <input name="work_email" type="email" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Téléphone</label>
            <input name="work_phone" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-bcp-muted">Site / bureau</label>
            <input name="office_location" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" className="rounded-full bg-bcp-navy px-5 py-2 text-xs font-semibold text-white">
              Créer / mettre à jour la fiche liée
            </button>
          </div>
        </form>
      </details>

      <section className="rounded-2xl border border-bcp-border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Nouveau service</h2>
        <form action={createHrDepartment} className="mt-3 flex flex-wrap items-end gap-2">
          <div>
            <label className="text-xs font-medium text-bcp-muted">Nom</label>
            <input name="name" required className="mt-1 rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-full border border-bcp-border px-4 py-2 text-xs font-semibold text-bcp-anthracite">
            Ajouter
          </button>
        </form>
      </section>

      <div className="overflow-hidden rounded-xl border border-bcp-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-bcp-border bg-bcp-cream/40 text-xs uppercase text-bcp-muted">
              <tr>
                <th className="px-4 py-3">Employé</th>
                <th className="px-4 py-3">Matricule</th>
                <th className="px-4 py-3">Poste</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Manager</th>
                <th className="px-4 py-3">Équipe</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Portail</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bcp-border">
              {employees.map((e) => {
                const pr = e.profiles
                  ? { email: e.profiles.email, display_name: e.profiles.display_name, role: e.profiles.role }
                  : null;
                const depName = e.department_id ? deptNameById.get(e.department_id) : undefined;
                const name = hrEmployeeDisplayName({ ...e, profiles: pr });
                const portal = (e as { portal_status?: string | null }).portal_status ?? "none";
                return (
                  <tr key={e.id} className="hover:bg-bcp-surface/60">
                    <td className="px-4 py-3">
                      <Link href={`/admin/hr/employees/${e.id}`} className="font-medium text-bcp-anthracite hover:text-bcp-navy">
                        {name}
                      </Link>
                      <p className="text-xs text-bcp-muted">{e.personal_email || pr?.email || e.work_email || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-bcp-muted">{e.employee_number || "—"}</td>
                    <td className="px-4 py-3">{e.job_title || "—"}</td>
                    <td className="px-4 py-3 text-bcp-muted">{depName || "—"}</td>
                    <td className="max-w-[8rem] truncate px-4 py-3 text-xs text-bcp-muted">{managerLabel(e.manager_user_id)}</td>
                    <td className="px-4 py-3 text-xs text-bcp-muted">{teamByEmployee.get(e.id) || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-bcp-surface px-2 py-0.5 text-xs font-medium text-bcp-anthracite">
                        {STATUS_LABEL[e.employment_status] ?? e.employment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-bcp-navy/5 px-2 py-0.5 text-xs font-medium text-bcp-navy">
                        {PORTAL_STATUS_LABEL[portal] ?? portal}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/hr/employees/${e.id}`} className="text-xs font-semibold text-bcp-navy hover:underline">
                        Fiche
                      </Link>
                      {portal !== "active" ? (
                        <Link
                          href={`/admin/hr/employees/${e.id}?tab=portal`}
                          className="ml-2 text-xs text-bcp-muted hover:text-bcp-navy"
                        >
                          Portail
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {employees.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-bcp-muted">Aucun résultat. Ajustez les filtres ou ajoutez un employé.</p>
        )}
      </div>
    </div>
  );
}
