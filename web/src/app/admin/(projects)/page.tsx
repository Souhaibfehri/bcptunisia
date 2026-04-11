import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile, getSessionUser, isFullAdmin, canAccessHrAdmin } from "@/lib/supabase/auth";
import {
  projectStatusStyle,
  projectStatusLabel,
  isOverdue,
  healthDotColor,
  computeProjectHealth,
} from "@/lib/status";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { buttonClass } from "@/components/ui/button-variants";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const supabase = await createServerSupabaseClient();
  const profile = await getProfile();
  const user = await getSessionUser();
  const fullAdmin = profile ? isFullAdmin(profile.role) : true;
  const hrBackoffice = profile ? canAccessHrAdmin(profile.role) : false;

  let scopedProjectIds: string[] | null = null;
  if (!fullAdmin && !hrBackoffice && user) {
    const { data: myMemberships } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("user_id", user.id);
    scopedProjectIds = [...new Set((myMemberships ?? []).map((m) => m.project_id))];
  }

  const projectQuery = supabase
    .from("projects")
    .select("id, name, status, client_id, clients ( name )")
    .order("created_at", { ascending: false });
  if (scopedProjectIds) projectQuery.in("id", scopedProjectIds.length > 0 ? scopedProjectIds : ["__none__"]);
  const { data: allProjects } = await projectQuery;

  const projects = allProjects ?? [];

  const statusCounts: Record<string, number> = {};
  for (const p of projects) {
    statusCounts[p.status] = (statusCounts[p.status] ?? 0) + 1;
  }

  const { count: clientCount } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true });

  const { count: userCount } = fullAdmin
    ? await supabase.from("profiles").select("id", { count: "exact", head: true })
    : { count: null };

  const scopeFilter = scopedProjectIds && scopedProjectIds.length > 0 ? scopedProjectIds : null;
  const noScope = scopedProjectIds !== null && scopedProjectIds.length === 0;

  const overdueTasksQuery = supabase
    .from("project_tasks")
    .select("id, title, due_on, status, stage_id, project_stages!inner ( project_id, projects!inner ( id, name ) )")
    .not("status", "in", '("completed","cancelled")')
    .not("due_on", "is", null)
    .order("due_on", { ascending: true })
    .limit(50);
  const { data: overdueTasks } = noScope ? { data: [] } : await overdueTasksQuery;

  const allOverdue = (overdueTasks ?? []).filter((t) => isOverdue(t.due_on, t.status));
  const trulyOverdue = scopeFilter
    ? allOverdue.filter((t) => {
        const sd = t.project_stages as { project_id: string } | { project_id: string }[] | null;
        const pid = sd ? (Array.isArray(sd) ? sd[0]?.project_id : sd.project_id) : null;
        return pid && scopeFilter.includes(pid);
      })
    : allOverdue;

  const now = new Date();
  const in14 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const milestonesQuery = supabase
    .from("project_milestones")
    .select("id, title, target_on, achieved_at, project_id, projects ( name )")
    .is("achieved_at", null)
    .not("target_on", "is", null)
    .lte("target_on", in14.toISOString().slice(0, 10))
    .order("target_on", { ascending: true })
    .limit(10);
  if (scopeFilter) milestonesQuery.in("project_id", scopeFilter);
  const { data: upcomingMilestones } = noScope ? { data: [] } : await milestonesQuery;

  const updatesQuery = supabase
    .from("project_updates")
    .select("id, title, created_at, project_id, projects ( name )")
    .order("created_at", { ascending: false })
    .limit(8);
  if (scopeFilter) updatesQuery.in("project_id", scopeFilter);
  const { data: recentUpdates } = noScope ? { data: [] } : await updatesQuery;

  const teamQuery = supabase
    .from("project_members")
    .select("user_id, role, project_id, profiles ( display_name, email )")
    .in("role", ["project_manager", "team_member"]);
  if (scopeFilter) teamQuery.in("project_id", scopeFilter);
  const { data: teamData } = noScope ? { data: [] } : await teamQuery;

  const teamMap = new Map<string, { name: string; count: number }>();
  for (const t of teamData ?? []) {
    const rawProfile = t.profiles as unknown;
    const pData = (Array.isArray(rawProfile) ? rawProfile[0] : rawProfile) as { display_name: string | null; email: string | null } | null;
    const label = pData?.display_name || pData?.email || t.user_id;
    const existing = teamMap.get(t.user_id);
    if (existing) {
      existing.count++;
    } else {
      teamMap.set(t.user_id, { name: label, count: 1 });
    }
  }

  const overdueInvQuery = supabase
    .from("invoices")
    .select("id, invoice_number, amount_cents, currency, due_on, status, project_id, projects ( name )")
    .in("status", ["sent", "overdue"])
    .not("due_on", "is", null)
    .order("due_on", { ascending: true })
    .limit(20);
  if (scopeFilter) overdueInvQuery.in("project_id", scopeFilter);
  const { data: overdueInvoicesRaw } = noScope ? { data: [] } : await overdueInvQuery;

  const overdueInvoices = (overdueInvoicesRaw ?? []).filter(
    (inv) => inv.due_on && new Date(inv.due_on) < now,
  );

  const unpaidInvQuery = supabase
    .from("invoices")
    .select("amount_cents, amount_paid_cents, status")
    .in("status", ["sent", "overdue", "partially_paid"]);
  if (scopeFilter) unpaidInvQuery.in("project_id", scopeFilter);
  const { data: unpaidInvoicesRaw } = noScope ? { data: [] } : await unpaidInvQuery;
  const totalUnpaid = (unpaidInvoicesRaw ?? []).reduce(
    (acc, inv) => acc + (inv.amount_cents - (inv.amount_paid_cents ?? 0)),
    0,
  );

  function relativeTime(iso: string): string {
    const diff = now.getTime() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "à l'instant";
    if (mins < 60) return `il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days}j`;
  }

  const attentionProjects = projects.filter((p) => {
    if (p.status === "on_hold") return true;
    return trulyOverdue.some((t) => {
      const stageData = t.project_stages as { project_id: string } | { project_id: string }[] | null;
      const pid = stageData ? (Array.isArray(stageData) ? stageData[0]?.project_id : stageData.project_id) : null;
      return pid === p.id;
    });
  });

  const stats: { label: string; value: string | number; bar: string }[] = [
    { label: "Projets", value: projects.length, bar: "from-bcp-navy to-bcp-slate" },
    { label: "Actifs", value: statusCounts.active ?? 0, bar: "from-bcp-navy/80 to-bcp-gold/40" },
    { label: "En pause", value: statusCounts.on_hold ?? 0, bar: "from-amber-400 to-amber-600" },
    { label: "Terminés", value: statusCounts.completed ?? 0, bar: "from-emerald-400 to-emerald-700" },
    { label: "Clients", value: clientCount ?? 0, bar: "from-bcp-gold to-bcp-copper" },
    ...(userCount !== null ? [{ label: "Utilisateurs", value: userCount, bar: "from-bcp-slate to-bcp-navy" }] : []),
    {
      label: "Tâches en retard",
      value: trulyOverdue.length,
      bar: trulyOverdue.length > 0 ? "from-red-400 to-red-700" : "from-bcp-border to-bcp-surface",
    },
    {
      label: "Factures impayées",
      value: `${(totalUnpaid / 100).toFixed(0)} TND`,
      bar: totalUnpaid > 0 ? "from-amber-400 to-amber-700" : "from-bcp-border to-bcp-surface",
    },
    {
      label: "Factures en retard",
      value: overdueInvoices.length,
      bar: overdueInvoices.length > 0 ? "from-red-400 to-red-700" : "from-bcp-border to-bcp-surface",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="bcp-page-title">Tableau de bord</h1>
          <p className="bcp-page-subtitle mt-1.5">
            Vue opérationnelle — projets, facturation, jalons et charge équipe.
          </p>
        </div>
        {fullAdmin && (
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center justify-center rounded-full bg-gradient-gold px-5 py-2.5 text-xs font-semibold text-bcp-anthracite shadow-md transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bcp-gold focus-visible:ring-offset-2"
          >
            + Nouveau projet
          </Link>
        )}
      </div>

      {/* Stats — primary row (portfolio), secondary row (risk & billing) */}
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {stats.slice(0, 4).map((s) => (
            <div
              key={s.label}
              className="overflow-hidden rounded-xl border border-bcp-border/90 bg-gradient-to-br from-white to-bcp-cream/30 shadow-sm ring-1 ring-bcp-navy/[0.02] transition hover:shadow-md"
            >
              <div className={`h-1 bg-gradient-to-r ${s.bar}`} />
              <div className="px-4 py-3.5 sm:px-4 sm:py-4">
                <p className="text-2xl font-bold tabular-nums tracking-tight text-bcp-navy sm:text-[1.65rem]">{s.value}</p>
                <p className="mt-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-bcp-muted">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {stats.slice(4).map((s) => (
            <div
              key={s.label}
              className="overflow-hidden rounded-xl border border-bcp-border/80 bg-gradient-to-br from-bcp-surface-raised/80 to-white shadow-sm transition hover:shadow-sm"
            >
              <div className={`h-px bg-gradient-to-r ${s.bar}`} />
              <div className="px-3 py-2.5 sm:px-3.5">
                <p className="text-lg font-semibold tabular-nums text-bcp-navy sm:text-xl">{s.value}</p>
                <p className="mt-1 text-[0.6rem] font-semibold uppercase tracking-wide text-bcp-muted">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attention */}
        <Card elevated>
          <SectionHeader
            title="Projets nécessitant une attention"
            description="En pause ou avec des tâches en retard sur le périmètre visible."
          />
          {attentionProjects.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-6 text-center">
              <p className="text-sm font-medium text-emerald-700">Tout est en ordre.</p>
              <p className="mt-1 text-xs text-emerald-600/70">Aucun projet ne nécessite d'attention immédiate.</p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {attentionProjects.slice(0, 8).map((p) => {
                const clientName = (() => {
                  const c = p.clients as { name: string } | { name: string }[] | null;
                  if (!c) return "—";
                  return Array.isArray(c) ? c[0]?.name ?? "—" : c.name;
                })();
                const hasOverdue = trulyOverdue.some((t) => {
                  const stageData = t.project_stages as { project_id: string } | { project_id: string }[] | null;
                  const pid = stageData ? (Array.isArray(stageData) ? stageData[0]?.project_id : stageData.project_id) : null;
                  return pid === p.id;
                });
                return (
                  <li
                    key={p.id}
                    className={`bcp-list-row ${hasOverdue ? "bcp-list-row--risk" : p.status === "on_hold" ? "bcp-list-row--attention" : ""}`}
                  >
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                      <span
                        className={`inline-block h-2 w-2 shrink-0 rounded-full ${hasOverdue ? "bg-[var(--status-danger-fg)]" : "bg-amber-500"}`}
                        aria-hidden
                      />
                      <Link href={`/admin/projects/${p.id}`} className="text-sm font-semibold text-bcp-anthracite hover:text-bcp-navy">
                        {p.name}
                      </Link>
                      <span className="text-xs text-bcp-muted">{clientName}</span>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${projectStatusStyle(p.status)}`}>
                      {projectStatusLabel(p.status)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card elevated>
          <SectionHeader title="Factures en retard" description="Échéance dépassée — à relancer ou régulariser." />
          {overdueInvoices.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-6 text-center">
              <p className="text-sm font-medium text-emerald-700">Aucune facture en retard.</p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {overdueInvoices.slice(0, 8).map((inv) => {
                const projName = (() => {
                  const prj = inv.projects as { name: string } | { name: string }[] | null;
                  if (!prj) return "";
                  return Array.isArray(prj) ? prj[0]?.name : prj.name;
                })();
                return (
                  <li key={inv.id} className="bcp-list-row bcp-list-row--risk text-sm">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                      <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--status-danger-fg)]" aria-hidden />
                      <Link href={`/admin/projects/${inv.project_id}`} className="font-semibold text-bcp-anthracite hover:text-bcp-navy">
                        {inv.invoice_number}
                      </Link>
                      <span className="text-xs text-bcp-muted">{projName}</span>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                      <span className="text-xs font-semibold tabular-nums text-[var(--status-danger-fg)]">Éch. {inv.due_on}</span>
                      <span className="text-xs tabular-nums text-bcp-muted">{(inv.amount_cents / 100).toFixed(2)} {inv.currency}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card elevated>
          <SectionHeader title="Jalons à venir (14 jours)" description="Prochaines échéances sur vos projets." />
          {(upcomingMilestones ?? []).length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-bcp-border bg-bcp-surface/30 px-4 py-6 text-center">
              <p className="text-sm text-bcp-muted">Aucun jalon imminent.</p>
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
          <SectionHeader title="Activité récente" description="Dernières actualités publiées sur les projets." />
          {(recentUpdates ?? []).length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-bcp-border bg-bcp-surface/30 px-4 py-6 text-center">
              <p className="text-sm text-bcp-muted">Aucune activité récente.</p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {(recentUpdates ?? []).map((u) => {
                const projName = (() => {
                  const prj = u.projects as { name: string } | { name: string }[] | null;
                  if (!prj) return "";
                  return Array.isArray(prj) ? prj[0]?.name : prj.name;
                })();
                return (
                  <li key={u.id} className="bcp-list-row bcp-list-row--stack text-sm">
                    <span className="font-medium text-bcp-anthracite">{u.title}</span>
                    <span className="text-xs text-bcp-muted sm:text-right">
                      {projName}
                      <span className="text-bcp-border"> · </span>
                      {relativeTime(u.created_at)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card elevated>
          <SectionHeader title="Équipe interne" description="Membres les plus sollicités sur le portefeuille." />
          {teamMap.size === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-bcp-border bg-bcp-surface/30 px-4 py-6 text-center">
              <p className="text-sm text-bcp-muted">Aucun collaborateur assigné.</p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {Array.from(teamMap.values())
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
                .map((t) => (
                  <li key={t.name} className="bcp-list-row text-sm">
                    <span className="font-medium text-bcp-anthracite">{t.name}</span>
                    <span className="rounded-full border border-bcp-border/80 bg-bcp-surface/80 px-2 py-0.5 text-xs font-medium tabular-nums text-bcp-muted">
                      {t.count} projet(s)
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>

      <Card accent>
        <SectionHeader title="Accès rapides" description="Navigation vers les modules clés de la plateforme." className="mb-4" />
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {fullAdmin && (
            <Link href="/admin/projects/new" className={buttonClass({ variant: "primary", size: "sm" })}>
              Nouveau projet
            </Link>
          )}
          <Link href="/admin/projects" className={buttonClass({ variant: "secondary", size: "sm" })}>
            Tous les projets
          </Link>
          {fullAdmin && (
            <>
              <Link href="/admin/clients" className={buttonClass({ variant: "secondary", size: "sm" })}>
                Clients
              </Link>
              <Link href="/admin/users" className={buttonClass({ variant: "secondary", size: "sm" })}>
                Utilisateurs
              </Link>
            </>
          )}
          <Link href="/portal/dashboard" className={buttonClass({ variant: "secondary", size: "sm" })}>
            Espace client
          </Link>
          {hrBackoffice && (
            <Link href="/admin/hr" className={buttonClass({ variant: "secondary", size: "sm" })}>
              Ressources humaines
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
