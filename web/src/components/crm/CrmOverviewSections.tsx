import Link from "next/link";
import type { CrmLeadRow } from "@/lib/crm/types";
import { CRM_STAGES } from "@/lib/crm/types";
import { crmStageLabel } from "@/lib/crm/stageLabels";
import {
  computeCrmKpis,
  recentLeads,
  upcomingFollowUps,
  leadsNeedingAction,
  type CrmRecentActivityRow,
} from "@/lib/crm/queries";
import { CrmKpiCards } from "@/components/crm/CrmKpiCards";
import { creatorLabel, profileLabel } from "@/components/crm/CrmLeadsTable";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

function activityKindOverview(kind: string): string {
  switch (kind) {
    case "lead_created":
      return "Création";
    case "stage_change":
      return "Étape";
    case "contacted":
      return "Contact";
    case "note_added":
      return "Note";
    case "assignment_change":
      return "Assignation";
    case "priority_change":
      return "Priorité";
    case "follow_up_change":
      return "Suivi";
    default:
      return kind.replace(/_/g, " ");
  }
}

function leadActionReasons(l: CrmLeadRow): string[] {
  const reasons: string[] = [];
  if (["won", "lost", "archived"].includes(l.stage)) return reasons;
  const now = Date.now();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = dayStart.getTime() + 86400000;
  if (l.follow_up_at) {
    const t = new Date(l.follow_up_at).getTime();
    if (t < now) reasons.push("Suivi en retard");
    else if (t >= dayStart.getTime() && t < dayEnd) reasons.push("Suivi aujourd’hui");
  }
  if (l.priority === "high" || l.priority === "urgent") reasons.push("Priorité élevée");
  if (!l.assigned_to) reasons.push("Non assigné");
  return reasons;
}

export function CrmOverviewSections({
  leads,
  nameByUserId,
  basePath,
  recentActivities = [],
}: {
  leads: CrmLeadRow[];
  nameByUserId: Record<string, string>;
  basePath: "/admin/leads" | "/employee/leads";
  recentActivities?: CrmRecentActivityRow[];
}) {
  const kpis = computeCrmKpis(leads);
  const recent = recentLeads(leads, 10);
  const upcoming = upcomingFollowUps(leads, 8);
  const toTreat = leadsNeedingAction(leads, 8);
  const leadTitleById = Object.fromEntries(leads.map((l) => [l.id, l.title]));

  return (
    <div className="space-y-10">
      <section>
        <SectionHeader
          title="Indicateurs clés"
          description="Vue consolidée du pipe commercial : volume, charge et alertes."
          className="mb-4"
        />
        <CrmKpiCards kpis={kpis} />
      </section>

      <section>
        <SectionHeader title="Pipeline par étape" description="Répartition des leads par étape du cycle." className="mb-3" />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {CRM_STAGES.map((s) => (
            <div
              key={s}
              className="flex items-center justify-between rounded-xl border border-bcp-border bg-gradient-to-r from-white to-bcp-cream/25 px-4 py-3 text-sm shadow-sm transition hover:border-bcp-navy/15 hover:shadow-md"
            >
              <span className="text-bcp-muted">{crmStageLabel(s)}</span>
              <span className="text-lg font-semibold tabular-nums text-bcp-navy">{kpis.byStage[s] ?? 0}</span>
            </div>
          ))}
        </div>
      </section>

      {toTreat.length > 0 ? (
        <section>
          <Card accent>
            <SectionHeader
              title="À traiter"
              description="Non assignés, suivis en retard ou du jour, ou priorité haute / urgente — sans doublon."
              className="mb-4"
            />
            <ul className="space-y-2">
              {toTreat.map((l) => {
                const reasons = leadActionReasons(l);
                return (
                  <li key={l.id}>
                    <Link
                      href={`${basePath}/${l.id}`}
                      className="flex flex-col rounded-xl border border-bcp-border/70 bg-bcp-surface/15 px-3 py-2.5 transition hover:border-bcp-gold/45 hover:bg-white hover:shadow-sm"
                    >
                      <span className="font-medium text-bcp-anthracite">{l.title}</span>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-bcp-muted">{crmStageLabel(l.stage)}</span>
                        {reasons.map((r) => (
                          <Badge
                            key={r}
                            className="border border-bcp-border/60 bg-bcp-navy/[0.06] text-[0.65rem] font-medium text-bcp-navy"
                          >
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <Card accent>
          <SectionHeader
            title="Derniers leads"
            action={
              <Link href={`${basePath}?view=list`} className="text-xs font-semibold text-bcp-navy hover:text-bcp-gold">
                Liste complète →
              </Link>
            }
            className="mb-4"
          />
          <ul className="space-y-2">
            {recent.length === 0 ? (
              <li className="rounded-lg border border-dashed border-bcp-border bg-bcp-surface/40 px-4 py-8 text-center text-sm text-bcp-muted">
                Aucun lead enregistré. Les formulaires du site apparaîtront ici.
              </li>
            ) : (
              recent.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`${basePath}/${l.id}`}
                    className="flex flex-col rounded-xl border border-bcp-border/70 bg-bcp-surface/15 px-3 py-2.5 transition hover:border-bcp-gold/45 hover:bg-white hover:shadow-sm"
                  >
                    <span className="font-medium text-bcp-anthracite">{l.title}</span>
                    <span className="text-xs text-bcp-muted">
                      {crmStageLabel(l.stage)} · {creatorLabel(nameByUserId, l.created_by)} ·{" "}
                      {new Date(l.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card accent>
          <SectionHeader
            title="Suivis à venir / retard"
            action={
              kpis.overdueFollowUps > 0 ? (
                <Badge className="border border-red-200/90 bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]">
                  {kpis.overdueFollowUps} retard(s)
                </Badge>
              ) : null
            }
            className="mb-4"
          />
          <ul className="space-y-2">
            {upcoming.length === 0 ? (
              <li className="rounded-lg border border-dashed border-bcp-border bg-bcp-surface/40 px-4 py-8 text-center text-sm text-bcp-muted">
                Aucun suivi planifié.
              </li>
            ) : (
              upcoming.map((l) => {
                const overdue =
                  l.follow_up_at &&
                  new Date(l.follow_up_at) < new Date() &&
                  !["won", "lost", "archived"].includes(l.stage);
                return (
                  <li key={l.id}>
                    <Link
                      href={`${basePath}/${l.id}`}
                      className={`flex flex-col rounded-xl border px-3 py-2.5 transition hover:shadow-sm ${
                        overdue
                          ? "border-red-200/90 bg-[var(--status-danger-bg)]/35 hover:border-red-300"
                          : "border-bcp-border/70 bg-bcp-surface/15 hover:border-bcp-gold/40 hover:bg-white"
                      }`}
                    >
                      <span className="font-medium text-bcp-anthracite">{l.title}</span>
                      <span className={`text-xs ${overdue ? "font-semibold text-red-800" : "text-bcp-muted"}`}>
                        {l.follow_up_at
                          ? new Date(l.follow_up_at).toLocaleString("fr-FR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : ""}{" "}
                        · {profileLabel(nameByUserId, l.assigned_to)}
                      </span>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </Card>
      </div>

      {recentActivities.length > 0 ? (
        <section>
          <Card>
            <SectionHeader
              title="Activité récente"
              description="Dernières actions enregistrées sur les leads visibles."
              className="mb-4"
            />
            <ul className="space-y-2">
              {recentActivities.map((a) => (
                <li
                  key={a.id}
                  className="rounded-lg border border-bcp-border/70 bg-bcp-surface/10 px-3 py-2 text-sm"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link
                      href={`${basePath}/${a.lead_id}`}
                      className="font-medium text-bcp-navy hover:text-bcp-gold"
                    >
                      {leadTitleById[a.lead_id] ?? "Lead"}
                    </Link>
                    <span className="text-xs text-bcp-muted">
                      {new Date(a.created_at).toLocaleString("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-bcp-muted">
                    <span className="font-semibold text-bcp-anthracite">{activityKindOverview(a.kind)}</span>
                    {" · "}
                    {profileLabel(nameByUserId, a.author_id)}
                  </p>
                  {a.body ? (
                    <p className="mt-1 line-clamp-2 text-xs text-bcp-anthracite">{a.body}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
