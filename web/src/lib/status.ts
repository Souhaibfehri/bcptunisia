export type ProjectStatus = "draft" | "active" | "on_hold" | "completed" | "archived";
export type WorkItemStatus = "pending" | "in_progress" | "completed" | "delayed" | "cancelled";
export type InvoiceStatus = "draft" | "sent" | "paid" | "partially_paid" | "pending_validation" | "overdue" | "cancelled";

/** BCP-harmonized chips: borders + soft tints aligned with brand navy/gold system */
const PROJECT_STATUS_STYLES: Record<ProjectStatus, string> = {
  draft: "border border-bcp-border bg-bcp-surface text-bcp-muted",
  active: "border border-bcp-navy/15 bg-bcp-navy/10 text-bcp-navy",
  on_hold: "border border-amber-200/90 bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]",
  completed: "border border-emerald-200/90 bg-[var(--status-success-bg)] text-[var(--status-success-fg)]",
  archived: "border border-bcp-border bg-bcp-cream/80 text-bcp-muted",
};

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Brouillon",
  active: "Actif",
  on_hold: "En pause",
  completed: "Terminé",
  archived: "Archivé",
};

const WORK_ITEM_STYLES: Record<WorkItemStatus, string> = {
  pending: "border border-bcp-border bg-bcp-surface text-bcp-muted",
  in_progress: "border border-bcp-navy/15 bg-bcp-navy/10 text-bcp-navy",
  completed: "border border-emerald-200/90 bg-[var(--status-success-bg)] text-[var(--status-success-fg)]",
  delayed: "border border-red-200/90 bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]",
  cancelled: "border border-bcp-border bg-bcp-surface text-bcp-muted line-through opacity-80",
};

const WORK_ITEM_LABELS: Record<WorkItemStatus, string> = {
  pending: "En attente",
  in_progress: "En cours",
  completed: "Terminé",
  delayed: "En retard",
  cancelled: "Annulé",
};

const INVOICE_STYLES: Record<InvoiceStatus, string> = {
  draft: "border border-bcp-border bg-bcp-surface text-bcp-muted",
  sent: "border border-bcp-navy/12 bg-[var(--status-info-bg)] text-[var(--status-info-fg)]",
  paid: "border border-emerald-200/90 bg-[var(--status-success-bg)] text-[var(--status-success-fg)]",
  partially_paid: "border border-amber-200/90 bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]",
  pending_validation: "border border-bcp-gold/35 bg-bcp-gold/15 text-bcp-anthracite",
  overdue: "border border-red-200/90 bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]",
  cancelled: "border border-bcp-border bg-bcp-surface text-bcp-muted line-through opacity-80",
};

const INVOICE_LABELS: Record<InvoiceStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyée",
  paid: "Payée",
  partially_paid: "Partiellement payée",
  pending_validation: "En validation",
  overdue: "En retard",
  cancelled: "Annulée",
};

export function projectStatusStyle(status: string): string {
  return PROJECT_STATUS_STYLES[status as ProjectStatus] ?? PROJECT_STATUS_STYLES.draft;
}

export function projectStatusLabel(status: string): string {
  return PROJECT_STATUS_LABELS[status as ProjectStatus] ?? status;
}

export function workItemStyle(status: string): string {
  return WORK_ITEM_STYLES[status as WorkItemStatus] ?? WORK_ITEM_STYLES.pending;
}

export function workItemLabel(status: string): string {
  return WORK_ITEM_LABELS[status as WorkItemStatus] ?? status;
}

export function invoiceStyle(status: string): string {
  return INVOICE_STYLES[status as InvoiceStatus] ?? INVOICE_STYLES.draft;
}

export function invoiceLabel(status: string): string {
  return INVOICE_LABELS[status as InvoiceStatus] ?? status;
}

export function isOverdue(dueOn: string | null, status: string): boolean {
  if (!dueOn) return false;
  if (status === "completed" || status === "cancelled" || status === "paid") return false;
  return new Date(dueOn) < new Date();
}

export function isDueSoon(dueOn: string | null, status: string, withinDays = 3): boolean {
  if (!dueOn) return false;
  if (status === "completed" || status === "cancelled" || status === "paid") return false;
  const due = new Date(dueOn);
  const now = new Date();
  if (due < now) return false;
  const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= withinDays;
}

export type HealthLevel = "healthy" | "at_risk" | "critical";

export function computeProjectHealth(tasks: { due_on: string | null; status: string }[]): HealthLevel {
  if (tasks.length === 0) return "healthy";
  const hasOverdue = tasks.some((t) => isOverdue(t.due_on, t.status));
  if (hasOverdue) return "critical";
  const hasDueSoon = tasks.some((t) => isDueSoon(t.due_on, t.status));
  if (hasDueSoon) return "at_risk";
  return "healthy";
}

const HEALTH_STYLES: Record<HealthLevel, string> = {
  healthy: "border border-emerald-200/90 bg-[var(--status-success-bg)] text-[var(--status-success-fg)]",
  at_risk: "border border-amber-200/90 bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]",
  critical: "border border-red-200/90 bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]",
};

const HEALTH_DOT: Record<HealthLevel, string> = {
  healthy: "bg-emerald-500",
  at_risk: "bg-amber-500",
  critical: "bg-red-500",
};

const HEALTH_LABELS: Record<HealthLevel, string> = {
  healthy: "En bonne voie",
  at_risk: "Attention",
  critical: "Critique",
};

export function healthStyle(level: HealthLevel): string {
  return HEALTH_STYLES[level];
}

export function healthDotColor(level: HealthLevel): string {
  return HEALTH_DOT[level];
}

export function healthLabel(level: HealthLevel): string {
  return HEALTH_LABELS[level];
}

export const MEMBER_ROLE_LABELS: Record<string, string> = {
  super_admin: "Super admin",
  admin: "Administrateur",
  hr_admin: "Admin RH",
  project_manager: "Chef de projet",
  people_manager: "Manager équipe",
  collaborator: "Collaborateur",
  client: "Client",
  team_member: "Équipe interne",
  client_contact: "Contact client",
  member: "Membre",
  observer: "Observateur",
};

export function memberRoleLabel(role: string): string {
  return MEMBER_ROLE_LABELS[role] ?? role;
}
