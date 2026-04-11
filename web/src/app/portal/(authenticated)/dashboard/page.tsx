import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile, getSessionUser } from "@/lib/supabase/auth";
import {
  projectStatusStyle,
  projectStatusLabel,
  computeProjectHealth,
  healthDotColor,
  isOverdue,
  invoiceStyle,
  invoiceLabel,
} from "@/lib/status";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const dynamic = "force-dynamic";

export default async function PortalDashboardPage() {
  const profile = await getProfile();
  const supabase = await createServerSupabaseClient();
  const user = await getSessionUser();

  const { data: companyRow } = profile?.client_id
    ? await supabase.from("clients").select("name").eq("id", profile.client_id).single()
    : { data: null };

  const { data: memberships } = user
    ? await supabase.from("project_members").select("project_id").eq("user_id", user.id)
    : { data: null };

  const ids = [...new Set((memberships ?? []).map((m) => m.project_id))];

  const { data: projects } =
    ids.length > 0
      ? await supabase
          .from("projects")
          .select("id, name, status, summary, objective, starts_on, ends_on")
          .in("id", ids)
          .neq("status", "archived")
      : { data: [] as { id: string; name: string; status: string; summary: string | null; objective: string | null; starts_on: string | null; ends_on: string | null }[] };

  const { data: stageRows } =
    ids.length > 0
      ? await supabase.from("project_stages").select("project_id, progress_percent").in("project_id", ids)
      : { data: [] as { project_id: string; progress_percent: number }[] };

  const { data: taskRows } =
    ids.length > 0
      ? await supabase.from("project_tasks").select("id, due_on, status, stage_id, project_stages!inner ( project_id )").in("project_stages.project_id", ids)
      : { data: [] as { id: string; due_on: string | null; status: string; stage_id: string; project_stages: { project_id: string } }[] };

  const progressByProject = new Map<string, number>();
  for (const pid of ids) {
    const rows = (stageRows ?? []).filter((r) => r.project_id === pid);
    if (rows.length === 0) { progressByProject.set(pid, 0); continue; }
    const sum = rows.reduce((a, r) => a + (r.progress_percent ?? 0), 0);
    progressByProject.set(pid, Math.round(sum / rows.length));
  }

  const tasksByProject = new Map<string, { due_on: string | null; status: string }[]>();
  for (const t of taskRows ?? []) {
    const stageData = t.project_stages as { project_id: string } | { project_id: string }[] | null;
    const pid = stageData ? (Array.isArray(stageData) ? stageData[0]?.project_id : stageData.project_id) : null;
    if (pid) {
      const arr = tasksByProject.get(pid) ?? [];
      arr.push({ due_on: t.due_on, status: t.status });
      tasksByProject.set(pid, arr);
    }
  }

  const { data: updateRows } =
    ids.length > 0
      ? await supabase
          .from("project_updates")
          .select("project_id, title, created_at")
          .in("project_id", ids)
          .eq("visible_to_client", true)
          .order("created_at", { ascending: false })
          .limit(80)
      : { data: [] as { project_id: string; title: string; created_at: string }[] };

  const lastUpdateByProject = new Map<string, { title: string; created_at: string }>();
  for (const u of updateRows ?? []) {
    if (!lastUpdateByProject.has(u.project_id)) {
      lastUpdateByProject.set(u.project_id, { title: u.title, created_at: u.created_at });
    }
  }

  const now = new Date();
  const in14 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const { data: upcomingMilestones } =
    ids.length > 0
      ? await supabase
          .from("project_milestones")
          .select("id, title, target_on, project_id, projects ( name )")
          .in("project_id", ids)
          .is("achieved_at", null)
          .not("target_on", "is", null)
          .lte("target_on", in14.toISOString().slice(0, 10))
          .order("target_on", { ascending: true })
          .limit(5)
      : { data: [] as { id: string; title: string; target_on: string; project_id: string; projects: { name: string } }[] };

  const { data: pendingInvoices } =
    ids.length > 0
      ? await supabase
          .from("invoices")
          .select("id, invoice_number, amount_cents, amount_paid_cents, currency, status, due_on, project_id, projects ( name )")
          .in("project_id", ids)
          .in("status", ["sent", "overdue", "partially_paid"])
          .order("due_on", { ascending: true })
          .limit(5)
      : { data: [] as { id: string; invoice_number: string; amount_cents: number; amount_paid_cents: number; currency: string; status: string; due_on: string | null; project_id: string; projects: { name: string } }[] };

  const { data: recentDocs } =
    ids.length > 0
      ? await supabase
          .from("project_documents")
          .select("id, filename, category, created_at, project_id, projects ( name )")
          .in("project_id", ids)
          .eq("visible_to_client", true)
          .order("created_at", { ascending: false })
          .limit(5)
      : { data: [] as { id: string; filename: string; category: string | null; created_at: string; project_id: string; projects: { name: string } }[] };

  const activeCount = (projects ?? []).filter((p) => p.status === "active").length;

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <div className="rounded-2xl border border-bcp-border/80 bg-gradient-to-r from-white to-bcp-cream/35 p-6 shadow-sm">
        <h1 className="bcp-page-title text-[1.65rem] tracking-tight sm:text-[1.85rem]">
          Bonjour{profile?.display_name ? `, ${profile.display_name}` : ""}
        </h1>
        <div className="bcp-page-subtitle mt-3 flex flex-wrap items-center gap-3 text-sm">
          {companyRow?.name && (
            <span className="rounded-full border border-bcp-gold/30 bg-bcp-gold/10 px-3 py-1 text-xs font-semibold text-bcp-navy">
              {companyRow.name}
            </span>
          )}
          <span>{activeCount} projet(s) actif(s)</span>
          {(upcomingMilestones ?? []).length > 0 && <span>· {(upcomingMilestones ?? []).length} jalon(s) à venir</span>}
          {(pendingInvoices ?? []).length > 0 && <span>· {(pendingInvoices ?? []).length} facture(s) en attente</span>}
        </div>
      </div>

      <section>
        <SectionHeader title="Mes projets" description="Suivez l'avancement et accédez aux détails de chaque mission." className="mb-4" />
        <div className="grid gap-4 sm:grid-cols-2">
          {(projects ?? []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-bcp-border bg-gradient-to-br from-bcp-surface/50 to-bcp-cream/25 p-10 text-center sm:col-span-2">
              <p className="text-sm font-semibold text-bcp-navy">Aucun projet assigné</p>
              <p className="mt-2 text-xs text-bcp-muted">Contactez BCP Tunisia pour obtenir l&apos;accès à vos projets.</p>
            </div>
          ) : (
            (projects ?? []).map((p) => {
              const progress = progressByProject.get(p.id) ?? 0;
              const last = lastUpdateByProject.get(p.id);
              const tasks = tasksByProject.get(p.id) ?? [];
              const health = computeProjectHealth(tasks);
              return (
                <Link
                  key={p.id}
                  href={`/portal/projects/${p.id}`}
                  className="group flex flex-col rounded-2xl border border-bcp-border/90 bg-gradient-to-br from-white to-bcp-cream/20 p-6 shadow-sm transition hover:border-bcp-gold/50 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-bcp-anthracite group-hover:text-bcp-navy">{p.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${healthDotColor(health)}`} />
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${projectStatusStyle(p.status)}`}>
                        {projectStatusLabel(p.status)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-bcp-surface">
                    <div className="h-full rounded-full bg-gradient-to-r from-bcp-gold to-bcp-copper transition-[width]" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-bcp-muted">Avancement : {progress}%</p>
                  {(p.summary || p.objective) && (
                    <p className="mt-3 line-clamp-2 text-sm text-bcp-muted">{p.objective || p.summary}</p>
                  )}
                  {last ? (
                    <p className="mt-3 text-xs text-bcp-muted">
                      Dernière actu : <span className="font-medium text-bcp-anthracite">{last.title}</span> · {new Date(last.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  ) : (
                    <p className="mt-3 text-xs text-bcp-muted">Aucune actualité publiée.</p>
                  )}
                  <p className="mt-4 text-xs font-semibold text-bcp-gold">Voir le détail →</p>
                </Link>
              );
            })
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming milestones */}
        <Card elevated>
          <SectionHeader title="Jalons à venir" description="Prochaines échéances sur vos chantiers." className="mb-3" />
          {(upcomingMilestones ?? []).length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-6 text-center">
              <p className="text-sm font-medium text-emerald-700">Aucun jalon imminent</p>
              <p className="mt-1 text-xs text-emerald-600/70">Tout est en ordre pour les prochains jours.</p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {(upcomingMilestones ?? []).map((ms) => {
                const projName = (() => {
                  const prj = ms.projects as { name: string } | { name: string }[] | null;
                  if (!prj) return "";
                  return Array.isArray(prj) ? prj[0]?.name : prj.name;
                })();
                const overdue = ms.target_on ? new Date(ms.target_on) < now : false;
                return (
                  <li key={ms.id} className={`bcp-list-row text-sm ${overdue ? "bcp-list-row--risk" : ""}`}>
                    <div className="min-w-0">
                      <span className="font-semibold text-bcp-anthracite">{ms.title}</span>
                      <span className="mt-0.5 block text-xs text-bcp-muted sm:ml-2 sm:mt-0 sm:inline">{projName}</span>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold tabular-nums ${overdue ? "text-[var(--status-danger-fg)]" : "text-bcp-muted"}`}
                    >
                      {ms.target_on}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card elevated>
          <SectionHeader title="Factures en attente" description="Montants et statuts à jour." className="mb-3" />
          {(pendingInvoices ?? []).length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-6 text-center">
              <p className="text-sm font-medium text-emerald-700">Aucune facture en attente</p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {(pendingInvoices ?? []).map((inv) => {
                const projName = (() => {
                  const prj = inv.projects as { name: string } | { name: string }[] | null;
                  if (!prj) return "";
                  return Array.isArray(prj) ? prj[0]?.name : prj.name;
                })();
                const overdue = isOverdue(inv.due_on, inv.status);
                return (
                  <li key={inv.id} className={`bcp-list-row flex-wrap text-sm ${overdue ? "bcp-list-row--risk" : ""}`}>
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="font-semibold text-bcp-anthracite">{inv.invoice_number}</span>
                      <span className="text-xs text-bcp-muted">{projName}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {overdue ? (
                        <span className="rounded-full border border-red-200/80 bg-[var(--status-danger-bg)] px-2 py-0.5 text-[0.65rem] font-semibold text-[var(--status-danger-fg)]">
                          En retard
                        </span>
                      ) : null}
                      <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${invoiceStyle(inv.status)}`}>
                        {invoiceLabel(inv.status)}
                      </span>
                      <span className="text-xs font-semibold tabular-nums text-bcp-anthracite">
                        {(inv.amount_cents / 100).toFixed(2)} {inv.currency}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card elevated>
        <SectionHeader title="Documents récents" description="Fichiers partagés par l’équipe projet." className="mb-3" />
        {(recentDocs ?? []).length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-bcp-border bg-bcp-surface/30 px-4 py-6 text-center">
            <p className="text-sm text-bcp-muted">Aucun document partagé pour le moment.</p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {(recentDocs ?? []).map((d) => {
              const projName = (() => {
                const prj = d.projects as { name: string } | { name: string }[] | null;
                if (!prj) return "";
                return Array.isArray(prj) ? prj[0]?.name : prj.name;
              })();
              const ext = d.filename?.split(".").pop()?.toLowerCase() ?? "";
              return (
                <li key={d.id} className="bcp-list-row text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-bcp-border/80 bg-gradient-to-br from-white to-bcp-cream/40 text-[0.6rem] font-bold uppercase text-bcp-muted shadow-sm">
                      {ext || "?"}
                    </span>
                    <Link href={`/portal/projects/${d.project_id}`} className="font-medium text-bcp-anthracite hover:text-bcp-navy">
                      {d.filename}
                    </Link>
                    {d.category && <span className="rounded-full bg-bcp-surface px-1.5 py-0.5 text-[0.6rem] text-bcp-muted">{d.category}</span>}
                  </div>
                  <span className="text-xs text-bcp-muted">{projName}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
