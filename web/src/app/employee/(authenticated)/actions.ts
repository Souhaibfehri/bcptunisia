"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEmployeeIdForProfile } from "@/lib/hr/resolve-employee";
import { fetchHrStaffUserIds, notifyUsers } from "@/lib/notifications/server";

async function requireEmployeePortal() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role === "client") throw new Error("Forbidden");
  const { data: emp } = await supabase.from("hr_employees").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!emp) throw new Error("Forbidden");
  return { supabase, user };
}

export async function submitLeaveRequest(formData: FormData) {
  const { supabase, user } = await requireEmployeePortal();
  const leave_type_id = String(formData.get("leave_type_id") ?? "").trim();
  const starts_on = String(formData.get("starts_on") ?? "").trim();
  const ends_on = String(formData.get("ends_on") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim() || null;
  if (!leave_type_id || !starts_on || !ends_on) {
    redirect("/employee/leave?error=Champs+requis");
  }
  const employeeId = await getEmployeeIdForProfile(supabase, user.id);
  if (!employeeId) redirect("/employee/leave?error=Employé+introuvable");

  const { error } = await supabase.from("hr_leave_requests").insert({
    employee_id: employeeId,
    leave_type_id,
    starts_on,
    ends_on,
    reason,
  });
  if (error) redirect(`/employee/leave?error=${encodeURIComponent(error.message)}`);
  const hrIds = await fetchHrStaffUserIds();
  await notifyUsers(hrIds, {
    title: "Nouvelle demande de congé",
    body: `Du ${starts_on} au ${ends_on}`,
    link: "/admin/hr/leave",
    kind: "leave_pending",
    metadata: { employee_user_id: user.id },
  });
  revalidatePath("/employee/leave");
  revalidatePath("/admin/hr");
  revalidatePath("/admin/hr/leave");
  redirect("/employee/leave?success=1");
}

export async function cancelOwnLeaveRequest(formData: FormData) {
  const { supabase, user } = await requireEmployeePortal();
  const id = String(formData.get("request_id") ?? "").trim();
  if (!id) redirect("/employee/leave?error=Requête+invalide");
  const employeeId = await getEmployeeIdForProfile(supabase, user.id);
  if (!employeeId) redirect("/employee/leave?error=Employé+introuvable");
  const { error } = await supabase
    .from("hr_leave_requests")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("employee_id", employeeId)
    .eq("status", "pending");
  if (error) redirect(`/employee/leave?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/employee/leave");
  revalidatePath("/admin/hr");
  revalidatePath("/admin/hr/leave");
  redirect("/employee/leave?success=cancel");
}

export async function logAttendanceSelf(formData: FormData) {
  const { supabase, user } = await requireEmployeePortal();
  const day = String(formData.get("day") ?? "").trim();
  const check_in = String(formData.get("check_in") ?? "").trim() || null;
  const check_out = String(formData.get("check_out") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  if (!day) redirect("/employee/attendance?error=Date+requise");

  const employeeId = await getEmployeeIdForProfile(supabase, user.id);
  if (!employeeId) redirect("/employee/attendance?error=Employé+introuvable");

  const { error } = await supabase.from("hr_attendance_events").insert({
    employee_id: employeeId,
    day,
    check_in: check_in || null,
    check_out: check_out || null,
    notes,
  });
  if (error) redirect(`/employee/attendance?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/employee/attendance");
  redirect("/employee/attendance?success=1");
}
