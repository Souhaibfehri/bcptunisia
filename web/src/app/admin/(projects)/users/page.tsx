import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createUserDirect, inviteUser } from "@/app/admin/actions";
import { AdminFlashBanner } from "@/components/admin/AdminFlashBanner";
import { memberRoleLabel } from "@/lib/status";
import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ error?: string; success?: string }> };

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, client_id, invited_at, clients ( id, name )")
    .order("created_at", { ascending: false });

  const { data: memberCounts } = await supabase
    .from("project_members")
    .select("user_id");

  const projectCountMap = new Map<string, number>();
  for (const row of memberCounts ?? []) {
    projectCountMap.set(row.user_id, (projectCountMap.get(row.user_id) ?? 0) + 1);
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .order("name");

  const roleBadge: Record<string, string> = {
    super_admin: "bg-red-100 text-red-800 ring-1 ring-red-200",
    admin: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
    hr_admin: "bg-teal-100 text-teal-800 ring-1 ring-teal-200",
    project_manager: "bg-violet-100 text-violet-800 ring-1 ring-violet-200",
    people_manager: "bg-sky-100 text-sky-800 ring-1 ring-sky-200",
    collaborator: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
    client: "bg-bcp-surface text-bcp-muted ring-1 ring-bcp-border",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-bcp-anthracite">
            Utilisateurs <span className="text-lg font-normal text-bcp-muted">({(profiles ?? []).length})</span>
          </h1>
          <p className="mt-1 text-sm text-bcp-muted">
            Gérer les rôles, rattachements, et accès projets.
          </p>
        </div>
      </div>

      <AdminFlashBanner error={sp.error} success={sp.success} />

      {/* Invite form */}
      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Inviter un utilisateur</h2>
        <form action={inviteUser} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="redirect_to" value="/admin/users" />
          <div className="min-w-[200px] flex-1">
            <label className="text-xs font-medium text-bcp-muted">E-mail</label>
            <input name="email" type="email" required placeholder="email@exemple.com" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div className="min-w-[150px]">
            <label className="text-xs font-medium text-bcp-muted">Nom (optionnel)</label>
            <input name="display_name" placeholder="Nom complet" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Rôle</label>
            <select name="role" defaultValue="client" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
              <option value="client">Client</option>
              <option value="collaborator">Collaborateur</option>
              <option value="project_manager">Chef de projet</option>
              <option value="people_manager">Manager équipe</option>
              <option value="hr_admin">Admin RH</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Entreprise</label>
            <select name="client_id" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
              <option value="">— Aucune —</option>
              {(clients ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Langue du lien (e-mail)</label>
            <select name="auth_locale" defaultValue="fr" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
              <option value="fr">FR</option>
              <option value="en">EN</option>
              <option value="ar">AR</option>
            </select>
          </div>
          <button type="submit" className="rounded-full bg-gradient-gold px-5 py-2 text-xs font-semibold text-bcp-anthracite shadow-sm">
            Envoyer l&apos;invitation
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Créer un compte (sans e-mail d&apos;invitation)</h2>
        <p className="mt-1 text-xs text-bcp-muted">
          Le compte est actif immédiatement (e-mail confirmé côté système). Mot de passe fort requis (12 caractères minimum) — à transmettre hors plateforme.
        </p>
        <form action={createUserDirect} className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1">
              <label className="text-xs font-medium text-bcp-muted">E-mail</label>
              <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div className="min-w-[180px] flex-1">
              <label className="text-xs font-medium text-bcp-muted">Mot de passe (12+ car.)</label>
              <input name="password" type="password" required minLength={12} autoComplete="new-password" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div className="min-w-[150px]">
              <label className="text-xs font-medium text-bcp-muted">Nom (optionnel)</label>
              <input name="display_name" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs font-medium text-bcp-muted">Rôle</label>
              <select name="role" defaultValue="collaborator" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
                <option value="client">Client</option>
                <option value="collaborator">Collaborateur</option>
                <option value="project_manager">Chef de projet</option>
                <option value="people_manager">Manager équipe</option>
                <option value="hr_admin">Admin RH</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Entreprise</label>
              <select name="client_id" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
                <option value="">— Aucune —</option>
                {(clients ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <input type="hidden" name="redirect_to" value="/admin/users" />
            <button type="submit" className="rounded-full border border-bcp-border bg-bcp-surface px-5 py-2 text-xs font-semibold text-bcp-anthracite hover:bg-bcp-cream">
              Créer le compte
            </button>
          </div>
        </form>
      </section>

      {/* Users table */}
      <div className="overflow-hidden rounded-xl border border-bcp-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-bcp-border bg-bcp-cream/40 text-xs uppercase text-bcp-muted">
            <tr>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Entreprise</th>
              <th className="px-4 py-3 text-center">Projets</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bcp-border">
            {(profiles ?? []).map((p) => {
              const clientName = (() => {
                const c = p.clients as { name: string } | { name: string }[] | null;
                if (!c) return null;
                return Array.isArray(c) ? c[0]?.name : c.name;
              })();
              const count = projectCountMap.get(p.id) ?? 0;
              const isInvited = !!p.invited_at;
              return (
                <tr key={p.id} className="hover:bg-bcp-surface/60">
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${p.id}`} className="block">
                      <p className="font-medium text-bcp-anthracite hover:text-bcp-navy">{p.display_name || "—"}</p>
                      <p className="text-xs text-bcp-muted">{p.email}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge[p.role] ?? roleBadge.client}`}>
                      {memberRoleLabel(p.role) || p.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {clientName ? (
                      <Link href={`/admin/clients/${p.client_id}`} className="text-sm text-bcp-anthracite hover:text-bcp-navy">
                        {clientName}
                      </Link>
                    ) : (
                      <span className="text-xs text-bcp-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {count > 0 ? (
                      <span className="rounded-full bg-bcp-surface px-2 py-0.5 text-xs font-medium text-bcp-anthracite">
                        {count}
                      </span>
                    ) : (
                      <span className="text-xs text-bcp-muted">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isInvited ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                        Invité
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                        Actif
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
