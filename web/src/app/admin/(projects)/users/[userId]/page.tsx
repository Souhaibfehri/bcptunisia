import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfile, isHrStaff } from "@/lib/supabase/auth";
import { AdminFlashBanner } from "@/components/admin/AdminFlashBanner";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import {
  updateUserRole,
  updateUserCrmAccess,
  linkUserToClient,
  unlinkUserFromClient,
  updateUserProfile,
  deleteUser,
  assignProjectMemberById,
  removeProjectMember,
} from "@/app/admin/actions";
import { memberRoleLabel, projectStatusStyle, projectStatusLabel, workItemStyle, workItemLabel } from "@/lib/status";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

const ROLE_BADGE: Record<string, string> = {
  super_admin: "bg-red-100 text-red-800 ring-1 ring-red-200",
  admin: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
  hr_admin: "bg-teal-100 text-teal-800 ring-1 ring-teal-200",
  project_manager: "bg-violet-100 text-violet-800 ring-1 ring-violet-200",
  people_manager: "bg-sky-100 text-sky-800 ring-1 ring-sky-200",
  collaborator: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  client: "bg-bcp-surface text-bcp-muted ring-1 ring-bcp-border",
};

export default async function AdminUserDetailPage({ params, searchParams }: PageProps) {
  const { userId } = await params;
  const sp = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: user } = await supabase
    .from("profiles")
    .select(
      "id, email, display_name, role, client_id, created_at, invited_at, disabled_at, crm_access_enabled, crm_access_scope, clients ( id, name )",
    )
    .eq("id", userId)
    .single();

  if (!user) notFound();

  const viewer = await getProfile();
  const { data: hrRow } = await supabase.from("hr_employees").select("id").eq("user_id", userId).maybeSingle();
  const showHrFicheLink = hrRow && viewer && isHrStaff(viewer.role);

  const { data: memberships } = await supabase
    .from("project_members")
    .select("project_id, role, projects ( id, name, status )")
    .eq("user_id", userId);

  const { data: assignedTasks } = await supabase
    .from("project_tasks")
    .select("id, title, status, due_on, stage_id, project_stages ( project_id, projects ( id, name ) )")
    .eq("assigned_to", userId)
    .not("status", "eq", "completed")
    .order("due_on", { ascending: true })
    .limit(20);

  const { data: clients } = await supabase.from("clients").select("id, name").order("name");
  const { data: allProjects } = await supabase.from("projects").select("id, name").order("name");

  const clientName = (() => {
    const c = user.clients as { id: string; name: string } | { id: string; name: string }[] | null;
    if (!c) return null;
    return Array.isArray(c) ? c[0]?.name ?? null : c.name;
  })();

  const redirectTo = `/admin/users/${userId}`;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/users" className="text-xs font-medium text-bcp-gold">
          ← Tous les utilisateurs
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-bcp-anthracite">
          {user.display_name || user.email || "Utilisateur"}
        </h1>
        <p className="mt-1 text-sm text-bcp-muted">{user.email}</p>
        {showHrFicheLink ? (
          <p className="mt-2">
            <Link
              href={`/admin/hr/employees/${hrRow.id}`}
              className="text-xs font-semibold text-bcp-gold hover:underline"
            >
              Ouvrir la fiche RH →
            </Link>
          </p>
        ) : null}
      </div>

      <AdminFlashBanner error={sp.error} success={sp.success} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Identity card */}
        <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Identité</h2>

          <div className="mt-4 space-y-3">
            <div>
              <span className="text-xs text-bcp-muted">Rôle</span>
              <div className="mt-1">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[user.role] ?? ROLE_BADGE.client}`}>
                  {memberRoleLabel(user.role) || user.role}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-bcp-muted">Entreprise</span>
              <p className="mt-0.5 text-sm font-medium text-bcp-anthracite">
                {clientName ? (
                  <Link href={`/admin/clients/${user.client_id}`} className="hover:text-bcp-navy underline">
                    {clientName}
                  </Link>
                ) : (
                  <span className="text-bcp-muted">— Aucune —</span>
                )}
              </p>
            </div>

            {user.created_at && (
              <div>
                <span className="text-xs text-bcp-muted">Inscrit le</span>
                <p className="mt-0.5 text-sm text-bcp-anthracite">{new Date(user.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
            )}

            {user.invited_at && (
              <div>
                <span className="text-xs text-bcp-muted">Invité le</span>
                <p className="mt-0.5 text-sm text-bcp-anthracite">{new Date(user.invited_at).toLocaleDateString("fr-FR")}</p>
              </div>
            )}
          </div>

          {/* Edit display name */}
          <form action={updateUserProfile} className="mt-6 border-t border-bcp-border pt-4">
            <input type="hidden" name="user_id" value={user.id} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <label className="text-xs font-medium text-bcp-muted">Nom affiché</label>
            <div className="mt-1 flex gap-2">
              <input
                name="display_name"
                defaultValue={user.display_name ?? ""}
                className="flex-1 rounded-lg border border-bcp-border px-3 py-1.5 text-sm"
                placeholder="Nom complet"
              />
              <button type="submit" className="rounded-lg bg-bcp-navy px-3 py-1.5 text-xs font-semibold text-white">
                Enregistrer
              </button>
            </div>
          </form>

          {/* Change role */}
          <form action={updateUserRole} className="mt-4 border-t border-bcp-border pt-4">
            <input type="hidden" name="user_id" value={user.id} />
            <label className="text-xs font-medium text-bcp-muted">Changer le rôle</label>
            <div className="mt-1 flex gap-2">
              <select name="role" defaultValue={user.role} className="flex-1 rounded-lg border border-bcp-border px-2 py-1.5 text-sm">
                <option value="client">Client</option>
                <option value="collaborator">Collaborateur</option>
                <option value="project_manager">Chef de projet</option>
                <option value="people_manager">Manager équipe</option>
                <option value="hr_admin">Admin RH</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <button type="submit" className="rounded-lg bg-bcp-navy px-3 py-1.5 text-xs font-semibold text-white">
                OK
              </button>
            </div>
          </form>

          {user.role !== "client" ? (
            <form action={updateUserCrmAccess} className="mt-4 border-t border-bcp-border pt-4">
              <input type="hidden" name="user_id" value={user.id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-bcp-muted">Accès CRM / vente</h3>
              <p className="mt-1 text-xs text-bcp-muted">
                Réservé aux comptes internes avec espace employé actif. Le rôle système reste inchangé ; ceci ajoute
                l&apos;accès à <strong>Leads / CRM</strong> dans l&apos;espace employé.
              </p>
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="crm_access_enabled"
                  value="on"
                  defaultChecked={Boolean(user.crm_access_enabled)}
                  className="rounded border-bcp-border"
                />
                <span>Autoriser l&apos;accès CRM (espace employé)</span>
              </label>
              <div className="mt-2">
                <label className="text-xs font-medium text-bcp-muted">Périmètre (si accès activé)</label>
                <select
                  name="crm_access_scope"
                  defaultValue={
                    user.crm_access_scope === "assigned" || user.crm_access_scope === "org"
                      ? user.crm_access_scope
                      : "assigned"
                  }
                  className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-1.5 text-sm"
                >
                  <option value="assigned">Assignés à l&apos;utilisateur uniquement</option>
                  <option value="org">Équipe / département (leads non assignés + même org)</option>
                </select>
              </div>
              <button type="submit" className="mt-3 rounded-lg bg-bcp-navy px-3 py-1.5 text-xs font-semibold text-white">
                Enregistrer l&apos;accès CRM
              </button>
            </form>
          ) : null}

          {/* Change company */}
          <form action={linkUserToClient} className="mt-4 border-t border-bcp-border pt-4">
            <input type="hidden" name="user_id" value={user.id} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <label className="text-xs font-medium text-bcp-muted">Rattacher à une entreprise</label>
            <div className="mt-1 flex gap-2">
              <select name="client_id" defaultValue={user.client_id ?? ""} className="flex-1 rounded-lg border border-bcp-border px-2 py-1.5 text-sm">
                <option value="">— Aucune —</option>
                {(clients ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button type="submit" className="rounded-lg bg-bcp-navy px-3 py-1.5 text-xs font-semibold text-white">
                OK
              </button>
            </div>
          </form>

          {user.client_id && (
            <form action={unlinkUserFromClient} className="mt-2">
              <input type="hidden" name="user_id" value={user.id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <button type="submit" className="text-xs text-red-500 hover:text-red-700">
                Retirer de l'entreprise
              </button>
            </form>
          )}

          {/* Delete user */}
          <div className="mt-6 border-t border-bcp-border pt-4">
            <ConfirmDeleteModal
              action={deleteUser}
              confirmLabel={`Tapez l'adresse e-mail de l'utilisateur pour confirmer : ${user.email}`}
              confirmPlaceholder={user.email ?? ""}
              hiddenFields={{ user_id: user.id }}
              triggerLabel="Supprimer cet utilisateur"
              triggerClassName="text-xs font-medium text-red-500 hover:text-red-700"
            />
          </div>
        </section>

        {/* Right column: projects + tasks */}
        <div className="space-y-6 lg:col-span-2">
          {/* Projects */}
          <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">
                Projets ({(memberships ?? []).length})
              </h2>
            </div>

            {(memberships ?? []).length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-bcp-border bg-bcp-surface/30 px-4 py-6 text-center">
                <p className="text-sm text-bcp-muted">Aucun projet assigné.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {(memberships ?? []).map((m) => {
                  const proj = m.projects as { id: string; name: string; status: string } | { id: string; name: string; status: string }[] | null;
                  const p = proj ? (Array.isArray(proj) ? proj[0] : proj) : null;
                  if (!p) return null;
                  return (
                    <div key={m.project_id} className="flex items-center justify-between rounded-lg bg-bcp-surface/60 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/projects/${p.id}`} className="text-sm font-medium text-bcp-anthracite hover:text-bcp-navy">
                          {p.name}
                        </Link>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${projectStatusStyle(p.status)}`}>
                          {projectStatusLabel(p.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-bcp-muted">{memberRoleLabel(m.role)}</span>
                        <form action={removeProjectMember}>
                          <input type="hidden" name="project_id" value={m.project_id} />
                          <input type="hidden" name="user_id" value={userId} />
                          <button type="submit" className="text-xs text-red-400 hover:text-red-600">Retirer</button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add to project */}
            <form action={assignProjectMemberById} className="mt-4 flex flex-wrap items-end gap-2 border-t border-bcp-border pt-4">
              <input type="hidden" name="user_id" value={userId} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <div className="flex-1">
                <label className="text-xs font-medium text-bcp-muted">Ajouter à un projet</label>
                <select name="project_id" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-1.5 text-sm">
                  <option value="">Choisir un projet</option>
                  {(allProjects ?? []).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-bcp-muted">Rôle</label>
                <select name="member_role" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-1.5 text-sm">
                  <option value="project_manager">Chef de projet</option>
                  <option value="team_member">Membre</option>
                  <option value="client_contact">Contact client</option>
                  <option value="observer">Observateur</option>
                </select>
              </div>
              <button type="submit" className="rounded-lg bg-bcp-navy px-4 py-1.5 text-xs font-semibold text-white">
                Ajouter
              </button>
            </form>
          </section>

          {/* Assigned tasks */}
          <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">
              Tâches assignées ({(assignedTasks ?? []).length})
            </h2>

            {(assignedTasks ?? []).length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-bcp-border bg-bcp-surface/30 px-4 py-6 text-center">
                <p className="text-sm text-bcp-muted">Aucune tâche en cours assignée.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {(assignedTasks ?? []).map((t) => {
                  const rawStage = t.project_stages as unknown;
                  const stageData = (Array.isArray(rawStage) ? rawStage[0] : rawStage) as { project_id: string; projects: { id: string; name: string } | { id: string; name: string }[] } | null;
                  const projRaw = stageData?.projects;
                  const proj = projRaw ? (Array.isArray(projRaw) ? projRaw[0] : projRaw) : null;
                  const isOverdue = t.due_on && new Date(t.due_on) < new Date() && t.status !== "completed";
                  return (
                    <div key={t.id} className="flex items-center justify-between rounded-lg bg-bcp-surface/60 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`inline-block h-2 w-2 rounded-full ${workItemStyle(t.status).split(" ")[0]?.replace("text-", "bg-") || "bg-gray-400"}`} />
                        <span className="text-sm font-medium text-bcp-anthracite">{t.title}</span>
                        {proj && (
                          <Link href={`/admin/projects/${proj.id}`} className="text-xs text-bcp-muted hover:text-bcp-navy">
                            {proj.name}
                          </Link>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${workItemStyle(t.status)}`}>
                          {workItemLabel(t.status)}
                        </span>
                        {t.due_on && (
                          <span className={`text-xs ${isOverdue ? "font-semibold text-red-600" : "text-bcp-muted"}`}>
                            {t.due_on}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
