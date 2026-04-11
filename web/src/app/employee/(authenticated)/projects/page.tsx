import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/auth";
import { memberRoleLabel, projectStatusLabel, projectStatusStyle, workItemLabel, workItemStyle } from "@/lib/status";
import { embedOne } from "@/lib/supabase/embed";

export const dynamic = "force-dynamic";

export default async function WorkspaceProjectsPage() {
  const profile = await getProfile();
  const supabase = await createServerSupabaseClient();
  if (!profile) return null;

  const { data: memberships } = await supabase
    .from("project_members")
    .select("project_id, role, projects ( id, name, status )")
    .eq("user_id", profile.id);

  const { data: tasks } = await supabase
    .from("project_tasks")
    .select("id, title, status, due_on, project_stages ( projects ( id, name ) )")
    .eq("assigned_to", profile.id)
    .not("status", "in", '("completed","cancelled")')
    .order("due_on", { ascending: true })
    .limit(30);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Mes projets</h2>
        {(memberships ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-bcp-muted">Aucun projet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {(memberships ?? []).map((m) => {
              const p = m.projects as { id: string; name: string; status: string } | { id: string; name: string; status: string }[] | null;
              const proj = p ? (Array.isArray(p) ? p[0] : p) : null;
              if (!proj) return null;
              return (
                <li key={m.project_id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-bcp-surface/60 px-3 py-2 text-sm">
                  <Link href={`/portal/projects/${proj.id}`} className="font-medium text-bcp-navy hover:underline">
                    {proj.name}
                  </Link>
                  <span className="text-xs text-bcp-muted">{memberRoleLabel(m.role)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${projectStatusStyle(proj.status)}`}>
                    {projectStatusLabel(proj.status)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Mes tâches ouvertes</h2>
        {(tasks ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-bcp-muted">Aucune tâche en cours.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {(tasks ?? []).map((t) => {
              type StagePr = { projects: { id: string; name: string } | { id: string; name: string }[] };
              const st = embedOne<StagePr>(t.project_stages);
              const pr = st?.projects ? embedOne<{ id: string; name: string }>(st.projects) : null;
              return (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-bcp-surface/60 px-3 py-2 text-sm">
                  <div>
                    <span className="font-medium text-bcp-anthracite">{t.title}</span>
                    {pr && (
                      <Link href={`/portal/projects/${pr.id}`} className="ml-2 text-xs text-bcp-muted hover:text-bcp-navy">
                        {pr.name}
                      </Link>
                    )}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${workItemStyle(t.status)}`}>{workItemLabel(t.status)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
