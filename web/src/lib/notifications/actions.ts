"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function safeNotificationsReturnTo(raw: string): string {
  const p = raw.trim() || "/admin/notifications";
  if (!p.startsWith("/") || p.startsWith("//")) return "/admin/notifications";
  if (!p.startsWith("/admin") && !p.startsWith("/portal") && !p.startsWith("/employee")) {
    return "/admin/notifications";
  }
  return p;
}

/** Internal navigation target after opening a notification (must stay on-app). */
function safeNotificationTarget(raw: string): string | null {
  const p = raw.trim();
  if (!p.startsWith("/") || p.startsWith("//")) return null;
  if (!p.startsWith("/admin") && !p.startsWith("/portal") && !p.startsWith("/employee")) return null;
  return p;
}

function revalidateNotificationSurfaces(returnTo: string) {
  revalidatePath(returnTo);
  revalidatePath("/admin/notifications");
  revalidatePath("/portal/notifications");
  revalidatePath("/employee/notifications");
  if (returnTo.startsWith("/admin")) {
    revalidatePath("/admin/projects", "layout");
    revalidatePath("/admin/hr", "layout");
    revalidatePath("/admin", "layout");
  }
  if (returnTo.startsWith("/portal")) {
    revalidatePath("/portal/dashboard", "layout");
  }
  if (returnTo.startsWith("/employee")) {
    revalidatePath("/employee", "layout");
  }
}

export async function markNotificationRead(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const returnTo = safeNotificationsReturnTo(String(formData.get("return_to") ?? ""));
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    console.error("[markNotificationRead]", error.message);
    return;
  }
  revalidateNotificationSurfaces(returnTo);
}

export async function markAllNotificationsRead(formData: FormData) {
  const returnTo = safeNotificationsReturnTo(String(formData.get("return_to") ?? ""));
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);
  if (error) {
    console.error("[markAllNotificationsRead]", error.message);
    return;
  }
  revalidateNotificationSurfaces(returnTo);
}

/** Mark one row read then redirect to its target (validated). */
export async function openNotificationAndMarkRead(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const target = safeNotificationTarget(String(formData.get("target") ?? ""));
  const returnTo = safeNotificationsReturnTo(String(formData.get("return_to") ?? ""));
  if (!id || !target) redirect(returnTo);
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(returnTo);
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    console.error("[openNotificationAndMarkRead]", error.message);
    redirect(returnTo);
  }
  revalidateNotificationSurfaces(returnTo);
  redirect(target);
}
