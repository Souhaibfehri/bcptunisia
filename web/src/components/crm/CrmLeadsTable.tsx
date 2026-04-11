import Link from "next/link";
import type { CrmLeadRow } from "@/lib/crm/types";
import { crmStageLabel } from "@/lib/crm/stageLabels";

export function profileLabel(map: Record<string, string>, id: string | null): string {
  if (!id) return "—";
  return map[id] ?? id.slice(0, 8) + "…";
}

/** For `created_by` on inbound website leads */
export function creatorLabel(map: Record<string, string>, id: string | null): string {
  if (id == null) return "Site public";
  return profileLabel(map, id);
}

export function CrmLeadsTable({
  leads,
  basePath,
  nameByUserId,
}: {
  leads: CrmLeadRow[];
  basePath: "/admin/leads" | "/employee/leads";
  nameByUserId: Record<string, string>;
}) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-bcp-border bg-gradient-to-br from-bcp-surface/50 to-bcp-cream/20 px-4 py-12 text-center text-sm text-bcp-muted">
        Aucun lead pour le moment.
      </div>
    );
  }

  return (
    <div className="bcp-table-wrap">
      <table className="bcp-table min-w-full text-left text-sm">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Société</th>
            <th>Étape</th>
            <th>Assigné</th>
            <th>MàJ</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => {
            const unassigned = !l.assigned_to;
            const urgent = l.priority === "high" || l.priority === "urgent";
            const overdueFollow =
              l.follow_up_at &&
              new Date(l.follow_up_at) < new Date() &&
              !["won", "lost", "archived"].includes(l.stage);
            return (
              <tr
                key={l.id}
                className={overdueFollow || urgent ? "bg-[var(--status-warning-bg)]/45" : undefined}
              >
                <td className="font-medium text-bcp-anthracite">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link href={`${basePath}/${l.id}`} className="hover:text-bcp-navy hover:underline">
                      {l.title}
                    </Link>
                    {urgent ? (
                      <span className="rounded border border-amber-200/80 bg-[var(--status-warning-bg)] px-1.5 py-px text-[0.6rem] font-semibold uppercase tracking-wide text-[var(--status-warning-fg)]">
                        Priorité
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="text-bcp-muted">
                  {l.company_name?.trim() || l.contact_name?.trim() || "—"}
                </td>
                <td>
                  <span className="inline-flex rounded-full border border-bcp-navy/12 bg-bcp-navy/[0.06] px-2 py-0.5 text-xs font-semibold text-bcp-navy">
                    {crmStageLabel(l.stage)}
                  </span>
                </td>
                <td
                  className={
                    unassigned
                      ? "text-xs font-medium text-[var(--status-warning-fg)]"
                      : "text-sm text-bcp-muted"
                  }
                >
                  {unassigned ? "Non assigné" : profileLabel(nameByUserId, l.assigned_to)}
                </td>
                <td className="whitespace-nowrap text-xs tabular-nums text-bcp-muted">
                  {new Date(l.updated_at).toLocaleString("fr-FR")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
