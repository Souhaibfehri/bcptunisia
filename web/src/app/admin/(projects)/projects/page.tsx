import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile, getSessionUser, isFullAdmin, isHrStaff } from "@/lib/supabase/auth";
import { AdminFlashBanner } from "@/components/admin/AdminFlashBanner";
import { projectStatusStyle, projectStatusLabel } from "@/lib/status";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ error?: string; success?: string; show_archived?: string }>;
};

export default async function AdminProjectsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const showArchived = sp.show_archived === "1";
  const supabase = await createServerSupabaseClient();
  const profile = await getProfile();
  const user = await getSessionUser();
  const fullAdmin = profile ? isFullAdmin(profile.role) : true;
  const hrStaff = profile ? isHrStaff(profile.role) : false;

  let scopedProjectIds: string[] | null = null;
  if (!fullAdmin && !hrStaff && user) {
    const { data: myMemberships } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("user_id", user.id);
    scopedProjectIds = [...new Set((myMemberships ?? []).map((m) => m.project_id))];
  }

  const projectQuery = supabase
    .from("projects")
    .select("id, name, status, clients ( name )")
    .order("created_at", { ascending: false });
  if (!showArchived) projectQuery.neq("status", "archived");
  if (scopedProjectIds) projectQuery.in("id", scopedProjectIds.length > 0 ? scopedProjectIds : ["__none__"]);
  const { data: projects } = await projectQuery;

  const projectIds = (projects ?? []).map((p) => p.id);
  const { data: pmMembers } = projectIds.length > 0
    ? await supabase
        .from("project_members")
        .select("project_id, profiles ( display_name, email )")
        .in("project_id", projectIds)
        .eq("role", "project_manager")
    : { data: [] as { project_id: string; profiles: { display_name: string | null; email: string | null } }[] };

  const pmByProject = new Map<string, string>();
  for (const pm of pmMembers ?? []) {
    if (pmByProject.has(pm.project_id)) continue;
    const prof = pm.profiles as { display_name: string | null; email: string | null } | { display_name: string | null; email: string | null }[] | null;
    const p = prof ? (Array.isArray(prof) ? prof[0] : prof) : null;
    if (p) pmByProject.set(pm.project_id, p.display_name || p.email || "—");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-bcp-anthracite">Projets</h1>
          <p className="mt-1 text-sm text-bcp-muted">Vue d'ensemble de tous les projets.</p>
        </div>
        {fullAdmin && (
          <Link
            href="/admin/projects/new"
            className="rounded-full bg-gradient-gold px-5 py-2.5 text-xs font-semibold text-bcp-anthracite shadow-sm hover:shadow-md transition"
          >
            + Nouveau projet
          </Link>
        )}
      </div>

      <AdminFlashBanner error={sp.error} success={sp.success} />

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {showArchived ? (
          <Link href="/admin/projects" className="font-medium text-bcp-navy hover:underline">
            Masquer les projets archivés
          </Link>
        ) : (
          <Link href="/admin/projects?show_archived=1" className="font-medium text-bcp-navy hover:underline">
            Afficher les archivés
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-bcp-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-bcp-border bg-bcp-cream/40 text-xs uppercase text-bcp-muted">
            <tr>
              <th className="px-4 py-3">Projet</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Chef de projet</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-bcp-border">
            {(projects ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-bcp-muted">
                  Aucun projet.{" "}
                  <Link href="/admin/projects/new" className="font-medium text-bcp-gold hover:text-bcp-copper">
                    Créer le premier projet →
                  </Link>
                </td>
              </tr>
            ) : (
              (projects ?? []).map((p) => {
                const clientName = (() => {
                  const c = p.clients as { name: string } | { name: string }[] | null;
                  if (!c) return "—";
                  return Array.isArray(c) ? c[0]?.name ?? "—" : c.name;
                })();
                return (
                  <tr key={p.id} className="hover:bg-bcp-surface/60">
                    <td className="px-4 py-3 font-medium text-bcp-anthracite">{p.name}</td>
                    <td className="px-4 py-3 text-bcp-muted">{clientName}</td>
                    <td className="px-4 py-3 text-xs text-bcp-muted">{pmByProject.get(p.id) ?? <span className="italic">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${projectStatusStyle(p.status)}`}>
                        {projectStatusLabel(p.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="text-xs font-semibold text-bcp-gold hover:text-bcp-copper"
                      >
                        Détail →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
