"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CrmLeadRow } from "@/lib/crm/types";
import { CRM_STAGES } from "@/lib/crm/types";
import { crmStageLabel } from "@/lib/crm/stageLabels";
import { creatorLabel, profileLabel } from "@/components/crm/CrmLeadsTable";

function followUpCellLabel(l: CrmLeadRow): { text: string; overdue: boolean; today: boolean } | null {
  if (!l.follow_up_at) return null;
  const closed = ["won", "lost", "archived"].includes(l.stage);
  if (closed) return null;
  const d = new Date(l.follow_up_at);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = start.getTime() + 86400000;
  const t = d.getTime();
  const overdue = t < now.getTime();
  const today = t >= start.getTime() && t < end;
  return {
    text: d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }),
    overdue,
    today,
  };
}

export function CrmLeadsListView({
  leads,
  nameByUserId,
  basePath,
}: {
  leads: CrmLeadRow[];
  nameByUserId: Record<string, string>;
  basePath: "/admin/leads" | "/employee/leads";
}) {
  const [q, setQ] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (stageFilter) {
        const eff = l.stage === "proposal" ? "proposal_sent" : l.stage;
        if (eff !== stageFilter) return false;
      }
      if (!t) return true;
      const blob = [
        l.title,
        l.company_name,
        l.contact_email,
        l.contact_phone,
        l.contact_name,
        l.service_category,
        l.request_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(t);
    });
  }, [leads, q, stageFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Rechercher (nom, société, e-mail…)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-bcp-border px-3 py-2 text-sm"
        />
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-lg border border-bcp-border px-3 py-2 text-sm"
        >
          <option value="">Toutes les étapes</option>
          {CRM_STAGES.map((s) => (
            <option key={s} value={s}>
              {crmStageLabel(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-bcp-border bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-bcp-border bg-bcp-surface/50 text-xs font-semibold uppercase tracking-wide text-bcp-muted">
            <tr>
              <th className="px-3 py-2">Lead</th>
              <th className="px-3 py-2">Société</th>
              <th className="px-3 py-2">E-mail</th>
              <th className="px-3 py-2">Étape</th>
              <th className="px-3 py-2">Priorité</th>
              <th className="px-3 py-2">Assigné</th>
              <th className="px-3 py-2">Suivi</th>
              <th className="px-3 py-2">Créé</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bcp-border">
            {filtered.map((l) => {
              const fu = followUpCellLabel(l);
              return (
                <tr key={l.id} className="hover:bg-bcp-surface/30">
                  <td className="px-3 py-2 font-medium text-bcp-anthracite">
                    <Link href={`${basePath}/${l.id}`} className="hover:text-bcp-navy hover:underline">
                      {l.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-bcp-muted">
                    {l.company_name?.trim() || l.contact_name?.trim() || "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-bcp-muted">{l.contact_email ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-bcp-navy/10 px-2 py-0.5 text-xs">{crmStageLabel(l.stage)}</span>
                  </td>
                  <td className="px-3 py-2 text-xs">{l.priority}</td>
                  <td className="px-3 py-2 text-xs text-bcp-muted">{profileLabel(nameByUserId, l.assigned_to)}</td>
                  <td
                    className={`px-3 py-2 text-xs ${
                      fu?.overdue ? "font-semibold text-red-600" : fu?.today ? "font-medium text-bcp-navy" : "text-bcp-muted"
                    }`}
                  >
                    {fu ? (
                      <>
                        {fu.text}
                        {fu.overdue ? " · retard" : fu.today ? " · aujourd’hui" : ""}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-bcp-muted">
                    {new Date(l.created_at).toLocaleDateString("fr-FR")}
                    <div className="text-[0.65rem] opacity-80">{creatorLabel(nameByUserId, l.created_by)}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-bcp-muted">Aucun lead ne correspond.</p>
        ) : null}
      </div>
    </div>
  );
}
