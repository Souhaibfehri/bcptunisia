import { createServiceRoleClient } from "@/lib/supabase/server";
import { notifyUsers } from "@/lib/notifications/server";

/** super_admin + admin */
export async function fetchCrmStaffUserIds(): Promise<string[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin.from("profiles").select("id").in("role", ["super_admin", "admin"]);
  if (error || !data) return [];
  return data.map((r) => r.id);
}

/** Internal users with CRM flag (typically employee + sales), excluding pure clients */
export async function fetchCrmSalesUserIds(): Promise<string[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .eq("crm_access_enabled", true)
    .neq("role", "client");
  if (error || !data) return [];
  return data.map((r) => r.id);
}

export async function notifyNewPublicLead(leadId: string, title: string): Promise<void> {
  const staff = await fetchCrmStaffUserIds();
  const sales = await fetchCrmSalesUserIds();
  const staffSet = new Set(staff);
  const salesOnly = sales.filter((id) => !staffSet.has(id));

  if (staff.length > 0) {
    await notifyUsers(staff, {
      kind: "crm_new_lead",
      title: "Nouveau lead (site web)",
      body: title,
      link: `/admin/leads/${leadId}`,
      metadata: { lead_id: leadId },
    });
  }
  if (salesOnly.length > 0) {
    await notifyUsers(salesOnly, {
      kind: "crm_new_lead",
      title: "Nouveau lead (site web)",
      body: title,
      link: `/employee/leads/${leadId}`,
      metadata: { lead_id: leadId },
    });
  }
}

export async function notifyLeadAssigned(
  assigneeId: string,
  leadId: string,
  title: string,
  actorUserId?: string | null,
): Promise<void> {
  const admin = createServiceRoleClient();
  const { data: prof } = await admin.from("profiles").select("role").eq("id", assigneeId).maybeSingle();
  const role = prof?.role ?? "";
  const link =
    role === "super_admin" || role === "admin" ? `/admin/leads/${leadId}` : `/employee/leads/${leadId}`;
  await notifyUsers([assigneeId], {
    kind: "crm_assigned",
    title: "Lead assigné",
    body: title,
    link,
    actor_user_id: actorUserId ?? null,
    entity_type: "crm_lead",
    entity_id: leadId,
    metadata: { lead_id: leadId },
  });
}

const STAGE_NOTIFY: Record<string, string> = {
  won: "Lead gagné",
  lost: "Lead perdu",
  proposal_sent: "Proposition envoyée",
  negotiation: "En négociation",
};

/** Notifies assignee on important pipeline moves (not every micro-drag). */
export async function notifyLeadStageMilestone(params: {
  assigneeId: string | null;
  leadId: string;
  title: string;
  actorId: string;
  toStage: string;
}): Promise<void> {
  const { assigneeId, leadId, title, actorId, toStage } = params;
  if (!assigneeId || assigneeId === actorId) return;
  const label = STAGE_NOTIFY[toStage];
  if (!label) return;
  const admin = createServiceRoleClient();
  const { data: prof } = await admin.from("profiles").select("role").eq("id", assigneeId).maybeSingle();
  const role = prof?.role ?? "";
  const link =
    role === "super_admin" || role === "admin" ? `/admin/leads/${leadId}` : `/employee/leads/${leadId}`;
  await notifyUsers([assigneeId], {
    kind: "crm_stage",
    title: label,
    body: title,
    link,
    actor_user_id: actorId,
    entity_type: "crm_lead",
    entity_id: leadId,
    severity: toStage === "won" || toStage === "lost" ? "high" : "normal",
    metadata: { lead_id: leadId, stage: toStage },
  });
}

export async function notifyLeadPriorityHigh(
  assigneeId: string,
  leadId: string,
  title: string,
  actorUserId: string | null,
): Promise<void> {
  if (!assigneeId || (actorUserId && assigneeId === actorUserId)) return;
  const admin = createServiceRoleClient();
  const { data: prof } = await admin.from("profiles").select("role").eq("id", assigneeId).maybeSingle();
  const role = prof?.role ?? "";
  const link =
    role === "super_admin" || role === "admin" ? `/admin/leads/${leadId}` : `/employee/leads/${leadId}`;
  await notifyUsers([assigneeId], {
    kind: "crm_priority",
    title: "Lead marqué prioritaire",
    body: title,
    link,
    actor_user_id: actorUserId,
    entity_type: "crm_lead",
    entity_id: leadId,
    severity: "high",
    metadata: { lead_id: leadId, priority: "high" },
  });
}
