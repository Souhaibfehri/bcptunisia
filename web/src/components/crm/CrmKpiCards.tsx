import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  Inbox,
  ListChecks,
  Target,
  Trophy,
  UserX,
} from "lucide-react";
import type { CrmKpis } from "@/lib/crm/queries";
import { StatCard, type StatCardTone } from "@/components/ui/StatCard";

type CardDef = {
  label: string;
  value: number;
  hint?: string;
  tone: StatCardTone;
  icon: LucideIcon;
};

export function CrmKpiCards({ kpis }: { kpis: CrmKpis }) {
  /** Operational focus: volume, assignment, risk — scan first */
  const primary: CardDef[] = [
    { label: "Total leads", value: kpis.total, hint: "Base active", tone: "navy", icon: BarChart3 },
    { label: "Non assignés", value: kpis.unassigned, hint: "À répartir", tone: "amber", icon: UserX },
    { label: "Priorité haute / urgente", value: kpis.highPriority, hint: "À traiter en priorité", tone: "rose", icon: AlertTriangle },
    { label: "Suivis en retard", value: kpis.overdueFollowUps, hint: "Date de suivi dépassée", tone: "rose", icon: Target },
  ];

  const secondary: CardDef[] = [
    { label: "Cette semaine", value: kpis.newThisWeek, hint: "Nouveaux sur 7 jours", tone: "gold", icon: CalendarDays },
    { label: "Ce mois", value: kpis.newThisMonth, hint: "Nouveaux sur 30 jours", tone: "default", icon: CalendarDays },
    {
      label: "Gagnés ce mois",
      value: kpis.wonThisMonth,
      hint: "Leads marqués gagnés (mois en cours)",
      tone: "emerald",
      icon: Trophy,
    },
    {
      label: "Suivis prévus aujourd’hui",
      value: kpis.dueToday,
      hint: "Rappels / suivi avec échéance aujourd’hui",
      tone: "navy",
      icon: CalendarCheck,
    },
    { label: "Gagnés (total)", value: kpis.won, hint: "Tous les leads gagnés", tone: "emerald", icon: ListChecks },
    { label: "Perdus", value: kpis.lost, hint: "Leads perdus", tone: "default", icon: Inbox },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {primary.map((c) => (
          <StatCard
            key={c.label}
            label={c.label}
            value={c.value}
            hint={c.hint}
            tone={c.tone}
            icon={c.icon}
            emphasis="primary"
          />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {secondary.map((c) => (
          <StatCard
            key={c.label}
            label={c.label}
            value={c.value}
            hint={c.hint}
            tone={c.tone}
            icon={c.icon}
            emphasis="secondary"
          />
        ))}
      </div>
    </div>
  );
}
