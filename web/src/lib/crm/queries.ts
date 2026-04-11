import type { CrmLeadRow } from "@/lib/crm/types";
import { CRM_STAGES } from "@/lib/crm/types";

export type CrmKpis = {
  total: number;
  newThisWeek: number;
  newThisMonth: number;
  unassigned: number;
  byStage: Record<string, number>;
  highPriority: number;
  overdueFollowUps: number;
  /** Follow-ups scheduled for the current calendar day (local), excluding closed stages */
  dueToday: number;
  /** Leads currently in `won` with `won_at` this month, or missing `won_at` but `updated_at` this month */
  wonThisMonth: number;
  won: number;
  lost: number;
  open: number;
  archived: number;
};

export type CrmRecentActivityRow = {
  id: string;
  lead_id: string;
  kind: string;
  body: string;
  created_at: string;
  author_id: string;
};

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function computeCrmKpis(leads: CrmLeadRow[]): CrmKpis {
  const now = new Date();
  const week0 = startOfWeek(now);
  const month0 = startOfMonth(now);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = dayStart.getTime() + 86400000;
  const byStage: Record<string, number> = {};
  for (const s of CRM_STAGES) byStage[s] = 0;

  let newThisWeek = 0;
  let newThisMonth = 0;
  let unassigned = 0;
  let highPriority = 0;
  let overdueFollowUps = 0;
  let dueToday = 0;
  let wonThisMonth = 0;
  let won = 0;
  let lost = 0;
  let open = 0;
  let archived = 0;

  for (const l of leads) {
    const created = new Date(l.created_at);
    if (created >= week0) newThisWeek += 1;
    if (created >= month0) newThisMonth += 1;
    if (!l.assigned_to) unassigned += 1;
    if (l.priority === "high" || l.priority === "urgent") highPriority += 1;
    const closedStage = ["won", "lost", "archived"].includes(l.stage);
    if (l.follow_up_at && !closedStage) {
      const fu = new Date(l.follow_up_at).getTime();
      if (fu < now.getTime()) overdueFollowUps += 1;
      if (fu >= dayStart.getTime() && fu < dayEnd) dueToday += 1;
    }
    if (l.stage === "won") {
      won += 1;
      const wonAt = l.won_at ? new Date(l.won_at) : null;
      if (wonAt && wonAt >= month0) wonThisMonth += 1;
      else if (!l.won_at && new Date(l.updated_at) >= month0) wonThisMonth += 1;
    }
    if (l.stage === "lost") lost += 1;
    if (l.status === "archived") archived += 1;
    else open += 1;
    let st = l.stage;
    if (st === "proposal") st = "proposal_sent";
    if (!(st in byStage)) st = "new";
    byStage[st] = (byStage[st] ?? 0) + 1;
  }

  return {
    total: leads.length,
    newThisWeek,
    newThisMonth,
    unassigned,
    byStage,
    highPriority,
    overdueFollowUps,
    dueToday,
    wonThisMonth,
    won,
    lost,
    open,
    archived,
  };
}

export function recentLeads(leads: CrmLeadRow[], n = 8): CrmLeadRow[] {
  return [...leads]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, n);
}

export function upcomingFollowUps(leads: CrmLeadRow[], n = 8): CrmLeadRow[] {
  const now = Date.now();
  return [...leads]
    .filter((l) => l.follow_up_at && !["won", "lost", "archived"].includes(l.stage))
    .sort((a, b) => new Date(a.follow_up_at!).getTime() - new Date(b.follow_up_at!).getTime())
    .slice(0, n);
}

/** Unassigned, overdue / today follow-up, or high/urgent — deduped, priority order, capped */
export function leadsNeedingAction(leads: CrmLeadRow[], cap = 8): CrmLeadRow[] {
  const closed = (l: CrmLeadRow) => ["won", "lost", "archived"].includes(l.stage);
  const open = leads.filter((l) => !closed(l));
  const nowMs = Date.now();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = dayStart.getTime() + 86400000;

  const overdue = open
    .filter((l) => l.follow_up_at && new Date(l.follow_up_at).getTime() < nowMs)
    .sort((a, b) => new Date(a.follow_up_at!).getTime() - new Date(b.follow_up_at!).getTime());
  const dueTodayOnly = open.filter((l) => {
    if (!l.follow_up_at) return false;
    const t = new Date(l.follow_up_at).getTime();
    return t >= dayStart.getTime() && t < dayEnd && t >= nowMs;
  });
  dueTodayOnly.sort((a, b) => new Date(a.follow_up_at!).getTime() - new Date(b.follow_up_at!).getTime());
  const urgentPrio = open.filter((l) => l.priority === "high" || l.priority === "urgent");
  const unassignedOnly = open.filter((l) => !l.assigned_to);

  const seen = new Set<string>();
  const out: CrmLeadRow[] = [];
  const push = (arr: CrmLeadRow[]) => {
    for (const l of arr) {
      if (out.length >= cap) return;
      if (seen.has(l.id)) continue;
      seen.add(l.id);
      out.push(l);
    }
  };
  push(overdue);
  push(dueTodayOnly);
  push(urgentPrio);
  push(unassignedOnly);
  return out;
}

export function leadsByStage(leads: CrmLeadRow[]): Map<string, CrmLeadRow[]> {
  const m = new Map<string, CrmLeadRow[]>();
  for (const s of CRM_STAGES) m.set(s, []);
  for (const l of leads) {
    let key = l.stage === "proposal" ? "proposal_sent" : l.stage;
    if (!CRM_STAGES.includes(key as (typeof CRM_STAGES)[number])) key = "new";
    m.get(key)!.push(l);
  }
  return m;
}
