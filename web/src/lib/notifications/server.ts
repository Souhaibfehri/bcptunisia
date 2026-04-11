import { createServiceRoleClient } from "@/lib/supabase/server";

export type NotifyPayload = {
  title: string;
  body?: string | null;
  link?: string | null;
  kind?: string;
  metadata?: Record<string, unknown>;
  actor_user_id?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  severity?: string | null;
};

/** Inserts rows for each recipient (service role — bypasses RLS). Server-only. */
export async function notifyUsers(userIds: string[], payload: NotifyPayload): Promise<void> {
  const ids = [...new Set(userIds)].filter(Boolean);
  if (ids.length === 0) return;
  const admin = createServiceRoleClient();
  const kind = payload.kind ?? "generic";
  const metadata = payload.metadata ?? {};
  const actor_user_id = payload.actor_user_id ?? null;
  const entity_type = payload.entity_type ?? null;
  const entity_id = payload.entity_id ?? null;
  const severity = payload.severity ?? null;
  const rows = ids.map((user_id) => ({
    user_id,
    title: payload.title,
    body: payload.body ?? null,
    link: payload.link ?? null,
    kind,
    metadata,
    actor_user_id,
    entity_type,
    entity_id,
    severity,
  }));
  const { error } = await admin.from("notifications").insert(rows);
  if (error) {
    console.error("[notifyUsers] insert failed:", error.message, error.code, { kind, recipientCount: ids.length });
  }
}

/** Project members excluding client-role accounts (for internal project alerts). */
export async function fetchInternalProjectMemberUserIds(projectId: string): Promise<string[]> {
  const admin = createServiceRoleClient();
  const { data: members, error: mErr } = await admin
    .from("project_members")
    .select("user_id")
    .eq("project_id", projectId);
  if (mErr || !members?.length) return [];
  const userIds = [...new Set(members.map((m) => m.user_id).filter(Boolean))] as string[];
  const { data: profiles, error: pErr } = await admin.from("profiles").select("id, role").in("id", userIds);
  if (pErr || !profiles) return [];
  return profiles.filter((p) => p.role !== "client").map((p) => p.id);
}

export async function fetchHrStaffUserIds(): Promise<string[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin.from("profiles").select("id").in("role", ["super_admin", "hr_admin"]);
  if (error || !data) return [];
  return data.map((r) => r.id);
}
