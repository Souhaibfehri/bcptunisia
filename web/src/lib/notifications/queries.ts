import { createServerSupabaseClient } from "@/lib/supabase/server";

export type NotificationFilter = "all" | "unread" | "read";

export function parseNotificationFilter(raw: string | undefined | null): NotificationFilter {
  if (raw === "unread" || raw === "read") return raw;
  return "all";
}

export type NotificationListRow = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
  kind: string | null;
  severity: string | null;
};

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);
  if (error) {
    console.error("[getUnreadNotificationCount]", error.message, error.code);
    return 0;
  }
  return count ?? 0;
}

export async function getNotificationTabCounts(): Promise<{ all: number; unread: number; read: number }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { all: 0, unread: 0, read: 0 };
  const uid = user.id;
  const [allRes, unreadRes, readRes] = await Promise.all([
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", uid),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", uid).is("read_at", null),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", uid).not("read_at", "is", null),
  ]);
  if (allRes.error) console.error("[getNotificationTabCounts] all", allRes.error.message);
  if (unreadRes.error) console.error("[getNotificationTabCounts] unread", unreadRes.error.message);
  if (readRes.error) console.error("[getNotificationTabCounts] read", readRes.error.message);
  return {
    all: allRes.count ?? 0,
    unread: unreadRes.count ?? 0,
    read: readRes.count ?? 0,
  };
}

export async function fetchNotificationsForCurrentUser(
  filter: NotificationFilter,
  limit = 100,
): Promise<NotificationListRow[]> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  let q = supabase
    .from("notifications")
    .select("id, title, body, link, read_at, created_at, kind, severity")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (filter === "unread") q = q.is("read_at", null);
  if (filter === "read") q = q.not("read_at", "is", null);
  const { data, error } = await q;
  if (error) {
    console.error("[fetchNotificationsForCurrentUser]", error.message, error.code);
    return [];
  }
  return (data ?? []) as NotificationListRow[];
}
