"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEmployeeIdForProfile, resolveEmployeeIdFromForm } from "@/lib/hr/resolve-employee";
import { recordApprovedLeaveConsumption, recordManualBalanceMovement } from "@/lib/hr/leave-balance";
import { notifyUsers } from "@/lib/notifications/server";
import { consumeMutationBurst } from "@/lib/server/mutationBurst";

const BUCKET = "hr-private";

async function requireHrSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: uErr,
  } = await supabase.auth.getUser();
  if (uErr || !user) throw new Error("Unauthorized");
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (pErr || !profile || (profile.role !== "super_admin" && profile.role !== "hr_admin")) {
    throw new Error("Forbidden");
  }
  return { supabase, user };
}

function safeFileSegment(name: string): string {
  return (name.replace(/[/\\]/g, "_").replace(/\.\./g, "_").slice(0, 200) || "file").trim();
}

function parseBool(v: FormDataEntryValue | null): boolean {
  const s = String(v ?? "").trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

/** Create employee with no auth/profile (Flow A). */
export async function createHrEmployeeRecord(formData: FormData) {
  const { supabase } = await requireHrSession();
  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  const personal_email = String(formData.get("personal_email") ?? "").trim();
  if (!first_name || !last_name || !personal_email) {
    redirect("/admin/hr/employees/new?error=Prénom+nom+et+e-mail+personnel+requis");
  }

  const employee_number = String(formData.get("employee_number") ?? "").trim() || null;
  const employment_status = String(formData.get("employment_status") ?? "active").trim();
  const employment_type = String(formData.get("employment_type") ?? "employee").trim();
  const contract_type = String(formData.get("contract_type") ?? "").trim() || null;
  const job_title = String(formData.get("job_title") ?? "").trim() || null;
  const department_id = String(formData.get("department_id") ?? "").trim() || null;
  const manager_user_id = String(formData.get("manager_user_id") ?? "").trim() || null;
  const hire_date = String(formData.get("hire_date") ?? "").trim() || null;
  const end_date = String(formData.get("end_date") ?? "").trim() || null;
  const work_email = String(formData.get("work_email") ?? "").trim() || null;
  const work_phone = String(formData.get("work_phone") ?? "").trim() || null;
  const personal_phone = String(formData.get("personal_phone") ?? "").trim() || null;
  const office_location = String(formData.get("office_location") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const emergency_contact_name = String(formData.get("emergency_contact_name") ?? "").trim() || null;
  const emergency_contact_phone = String(formData.get("emergency_contact_phone") ?? "").trim() || null;
  const employee_notes = String(formData.get("employee_notes") ?? "").trim() || null;
  const civp_eligible = parseBool(formData.get("civp_eligible"));
  const team_id = String(formData.get("team_id") ?? "").trim() || null;

  const row = {
    user_id: null as string | null,
    first_name,
    last_name,
    personal_email,
    personal_phone,
    address,
    emergency_contact_name,
    emergency_contact_phone,
    employee_notes,
    civp_eligible,
    portal_status: "none" as const,
    employee_number,
    employment_status,
    employment_type,
    contract_type,
    job_title,
    department_id: department_id || null,
    manager_user_id: manager_user_id || null,
    hire_date: hire_date || null,
    end_date: end_date || null,
    work_email,
    work_phone,
    office_location,
  };

  const { data: created, error } = await supabase.from("hr_employees").insert(row).select("id").single();
  if (error || !created?.id) {
    redirect(`/admin/hr/employees/new?error=${encodeURIComponent(error?.message ?? "Création impossible")}`);
  }

  const employeeId = created.id as string;

  if (team_id) {
    await supabase.from("hr_team_members").insert({ team_id, employee_id: employeeId, role: "member" });
  }

  const eduInst = String(formData.get("education_institution") ?? "").trim();
  const eduDegree = String(formData.get("education_degree") ?? "").trim();
  const eduField = String(formData.get("education_field") ?? "").trim();
  const eduEnded = String(formData.get("education_ended_on") ?? "").trim() || null;
  if (eduInst || eduDegree || eduField) {
    await supabase.from("hr_employee_education").insert({
      employee_id: employeeId,
      institution: eduInst || null,
      degree: eduDegree || null,
      field: eduField || null,
      ended_on: eduEnded,
    });
  }

  revalidatePath("/admin/hr");
  revalidatePath("/admin/hr/employees", "page");
  revalidatePath("/admin/hr/employees");
  revalidatePath(`/admin/hr/employees/${employeeId}`);
  redirect(`/admin/hr/employees/${employeeId}?success=created`);
}

/** Update core HR fields by employee id (does not change portal link). */
export async function updateHrEmployeeCore(formData: FormData) {
  const { supabase } = await requireHrSession();
  const employeeId = String(formData.get("employee_id") ?? "").trim();
  if (!employeeId) redirect("/admin/hr/employees?error=Fiche+requis");

  const first_name = String(formData.get("first_name") ?? "").trim() || null;
  const last_name = String(formData.get("last_name") ?? "").trim() || null;
  const personal_email = String(formData.get("personal_email") ?? "").trim() || null;
  const personal_phone = String(formData.get("personal_phone") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const emergency_contact_name = String(formData.get("emergency_contact_name") ?? "").trim() || null;
  const emergency_contact_phone = String(formData.get("emergency_contact_phone") ?? "").trim() || null;
  const employee_notes = String(formData.get("employee_notes") ?? "").trim() || null;
  const civp_eligible = parseBool(formData.get("civp_eligible"));

  const employee_number = String(formData.get("employee_number") ?? "").trim() || null;
  const employment_status = String(formData.get("employment_status") ?? "active").trim();
  const employment_type = String(formData.get("employment_type") ?? "employee").trim();
  const contract_type = String(formData.get("contract_type") ?? "").trim() || null;
  const job_title = String(formData.get("job_title") ?? "").trim() || null;
  const department_id = String(formData.get("department_id") ?? "").trim() || null;
  const manager_user_id = String(formData.get("manager_user_id") ?? "").trim() || null;
  const hire_date = String(formData.get("hire_date") ?? "").trim() || null;
  const end_date = String(formData.get("end_date") ?? "").trim() || null;
  const work_email = String(formData.get("work_email") ?? "").trim() || null;
  const work_phone = String(formData.get("work_phone") ?? "").trim() || null;
  const office_location = String(formData.get("office_location") ?? "").trim() || null;

  const patch = {
    first_name,
    last_name,
    personal_email,
    personal_phone,
    address,
    emergency_contact_name,
    emergency_contact_phone,
    employee_notes,
    civp_eligible,
    employee_number,
    employment_status,
    employment_type,
    contract_type,
    job_title,
    department_id: department_id || null,
    manager_user_id: manager_user_id || null,
    hire_date: hire_date || null,
    end_date: end_date || null,
    work_email,
    work_phone,
    office_location,
  };

  const { error } = await supabase.from("hr_employees").update(patch).eq("id", employeeId);
  if (error) {
    redirect(`/admin/hr/employees/${employeeId}?error=${encodeURIComponent(error.message)}&tab=personal`);
  }
  revalidatePath("/admin/hr");
  revalidatePath("/admin/hr/employees");
  revalidatePath(`/admin/hr/employees/${employeeId}`);
  redirect(`/admin/hr/employees/${employeeId}?success=employee&tab=personal`);
}

/** Update job / contract fields only (does not touch identity or personal contact). */
export async function updateHrEmployeeJob(formData: FormData) {
  const { supabase } = await requireHrSession();
  const employeeId = String(formData.get("employee_id") ?? "").trim();
  if (!employeeId) redirect("/admin/hr/employees?error=Fiche+requis");

  const employee_number = String(formData.get("employee_number") ?? "").trim() || null;
  const employment_status = String(formData.get("employment_status") ?? "active").trim();
  const employment_type = String(formData.get("employment_type") ?? "employee").trim();
  const contract_type = String(formData.get("contract_type") ?? "").trim() || null;
  const job_title = String(formData.get("job_title") ?? "").trim() || null;
  const department_id = String(formData.get("department_id") ?? "").trim() || null;
  const manager_user_id = String(formData.get("manager_user_id") ?? "").trim() || null;
  const hire_date = String(formData.get("hire_date") ?? "").trim() || null;
  const end_date = String(formData.get("end_date") ?? "").trim() || null;
  const work_email = String(formData.get("work_email") ?? "").trim() || null;
  const work_phone = String(formData.get("work_phone") ?? "").trim() || null;
  const office_location = String(formData.get("office_location") ?? "").trim() || null;
  const civp_eligible = parseBool(formData.get("civp_eligible"));

  const { error } = await supabase
    .from("hr_employees")
    .update({
      employee_number,
      employment_status,
      employment_type,
      contract_type,
      job_title,
      department_id: department_id || null,
      manager_user_id: manager_user_id || null,
      hire_date: hire_date || null,
      end_date: end_date || null,
      work_email,
      work_phone,
      office_location,
      civp_eligible,
    })
    .eq("id", employeeId);
  if (error) redirect(`/admin/hr/employees/${employeeId}?error=${encodeURIComponent(error.message)}&tab=hr`);
  revalidatePath("/admin/hr");
  revalidatePath("/admin/hr/employees");
  revalidatePath(`/admin/hr/employees/${employeeId}`);
  redirect(`/admin/hr/employees/${employeeId}?success=employee&tab=hr`);
}

/** Link an existing profile to this employee row (Flow B — active portal). */
export async function linkHrEmployeeUser(formData: FormData) {
  const { supabase } = await requireHrSession();
  const employeeId = String(formData.get("employee_id") ?? "").trim();
  const profileUserId = String(formData.get("profile_user_id") ?? "").trim();
  if (!employeeId || !profileUserId) redirect(`/admin/hr/employees/${employeeId}?error=Lien+invalide`);

  const { data: other } = await supabase
    .from("hr_employees")
    .select("id")
    .eq("user_id", profileUserId)
    .neq("id", employeeId)
    .maybeSingle();
  if (other) redirect(`/admin/hr/employees/${employeeId}?error=Profil+déjà+rattaché`);

  const { error } = await supabase
    .from("hr_employees")
    .update({
      user_id: profileUserId,
      portal_status: "active",
      portal_linked_at: new Date().toISOString(),
      portal_invited_at: null,
    })
    .eq("id", employeeId);
  if (error) redirect(`/admin/hr/employees/${employeeId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/hr/employees");
  revalidatePath(`/admin/hr/employees/${employeeId}`);
  redirect(`/admin/hr/employees/${employeeId}?success=linked&tab=portal`);
}

export async function setHrPortalInvitePending(formData: FormData) {
  const { supabase } = await requireHrSession();
  const employeeId = String(formData.get("employee_id") ?? "").trim();
  if (!employeeId) redirect("/admin/hr/employees?error=Fiche+requis");
  const { error } = await supabase
    .from("hr_employees")
    .update({
      portal_status: "invite_pending",
      portal_invited_at: new Date().toISOString(),
    })
    .eq("id", employeeId);
  if (error) redirect(`/admin/hr/employees/${employeeId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/admin/hr/employees/${employeeId}`);
  redirect(`/admin/hr/employees/${employeeId}?success=invite`);
}

/** Disable portal access; clears user link so RLS self-access stops. */
export async function disableHrEmployeePortal(formData: FormData) {
  const { supabase } = await requireHrSession();
  const employeeId = String(formData.get("employee_id") ?? "").trim();
  if (!employeeId) redirect("/admin/hr/employees?error=Fiche+requis");
  const { error } = await supabase
    .from("hr_employees")
    .update({
      user_id: null,
      portal_status: "disabled",
    })
    .eq("id", employeeId);
  if (error) redirect(`/admin/hr/employees/${employeeId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/admin/hr/employees/${employeeId}`);
  redirect(`/admin/hr/employees/${employeeId}?success=disabled`);
}

/**
 * Deletes the HR dossier (cascade removes congés, documents RH liés, etc.).
 * Confirmation must match one of: profil e-mail, e-mail personnel ou e-mail pro de la fiche.
 * Ne supprime pas le compte Auth — utiliser la suppression utilisateur côté admin complet pour cela.
 */
export async function deleteHrEmployeeDossier(formData: FormData) {
  const { supabase } = await requireHrSession();
  const employeeId = String(formData.get("employee_id") ?? "").trim();
  const confirmEmail = String(formData.get("confirm_email") ?? "").trim().toLowerCase();
  if (!employeeId || !confirmEmail) {
    redirect("/admin/hr/employees?error=Confirmation+requise");
  }

  const { data: emp, error: empErr } = await supabase
    .from("hr_employees")
    .select("id, user_id, personal_email, work_email")
    .eq("id", employeeId)
    .maybeSingle();
  if (empErr || !emp) {
    redirect("/admin/hr/employees?error=Fiche+introuvable");
  }

  const allowed = new Set<string>();
  const pe = String(emp.personal_email ?? "").trim().toLowerCase();
  const we = String(emp.work_email ?? "").trim().toLowerCase();
  if (pe) allowed.add(pe);
  if (we) allowed.add(we);
  if (emp.user_id) {
    const { data: prof } = await supabase.from("profiles").select("email").eq("id", emp.user_id).maybeSingle();
    const em = String(prof?.email ?? "").trim().toLowerCase();
    if (em) allowed.add(em);
  }
  if (!allowed.has(confirmEmail)) {
    redirect(
      `/admin/hr/employees/${employeeId}?error=${encodeURIComponent("La confirmation ne correspond à aucun e-mail reconnu pour cette fiche.")}`,
    );
  }

  const { error: delErr } = await supabase.from("hr_employees").delete().eq("id", employeeId);
  if (delErr) {
    redirect(`/admin/hr/employees/${employeeId}?error=${encodeURIComponent(delErr.message)}`);
  }

  revalidatePath("/admin/hr");
  revalidatePath("/admin/hr/employees");
  revalidatePath(`/admin/hr/employees/${employeeId}`);
  redirect("/admin/hr/employees?success=employee-deleted");
}

/** Legacy: create/update fiche by profile id (invited user). */
export async function upsertHrEmployee(formData: FormData) {
  const { supabase } = await requireHrSession();
  const userId = String(formData.get("user_id") ?? "").trim();
  if (!userId) redirect("/admin/hr/employees?error=Utilisateur+requis");

  const employee_number = String(formData.get("employee_number") ?? "").trim() || null;
  const employment_status = String(formData.get("employment_status") ?? "active").trim();
  const employment_type = String(formData.get("employment_type") ?? "employee").trim();
  const contract_type = String(formData.get("contract_type") ?? "").trim() || null;
  const job_title = String(formData.get("job_title") ?? "").trim() || null;
  const department_id = String(formData.get("department_id") ?? "").trim() || null;
  const manager_user_id = String(formData.get("manager_user_id") ?? "").trim() || null;
  const hire_date = String(formData.get("hire_date") ?? "").trim() || null;
  const end_date = String(formData.get("end_date") ?? "").trim() || null;
  const work_email = String(formData.get("work_email") ?? "").trim() || null;
  const work_phone = String(formData.get("work_phone") ?? "").trim() || null;
  const office_location = String(formData.get("office_location") ?? "").trim() || null;

  const row = {
    user_id: userId,
    employee_number,
    employment_status,
    employment_type,
    contract_type,
    job_title,
    department_id: department_id || null,
    manager_user_id: manager_user_id || null,
    hire_date: hire_date || null,
    end_date: end_date || null,
    work_email,
    work_phone,
    office_location,
    portal_status: "active" as const,
    portal_linked_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase.from("hr_employees").select("id").eq("user_id", userId).maybeSingle();
  let employeeId: string;
  if (existing?.id) {
    const { error } = await supabase.from("hr_employees").update(row).eq("id", existing.id);
    if (error) redirect(`/admin/hr/employees/${existing.id}?error=${encodeURIComponent(error.message)}`);
    employeeId = existing.id as string;
  } else {
    const { data: ins, error } = await supabase.from("hr_employees").insert(row).select("id").single();
    if (error || !ins?.id) redirect(`/admin/hr/employees?error=${encodeURIComponent(error?.message ?? "insert")}`);
    employeeId = ins.id as string;
  }

  revalidatePath("/admin/hr");
  revalidatePath("/admin/hr/employees");
  revalidatePath(`/admin/hr/employees/${employeeId}`);
  redirect(`/admin/hr/employees/${employeeId}?success=employee`);
}

export async function upsertHrSensitive(formData: FormData) {
  const { supabase } = await requireHrSession();
  const employeeId = await resolveEmployeeIdFromForm(supabase, formData);
  if (!employeeId) redirect("/admin/hr/employees?error=Fiche+requis");

  const salaryRaw = String(formData.get("annual_salary_cents") ?? "").trim();
  const annual_salary_cents = salaryRaw ? Math.round(Number(salaryRaw) * 100) : null;
  const currency = String(formData.get("currency") ?? "TND").trim() || "TND";
  const pay_frequency = String(formData.get("pay_frequency") ?? "").trim() || null;
  const bank_iban = String(formData.get("bank_iban") ?? "").trim() || null;
  const hr_private_notes = String(formData.get("hr_private_notes") ?? "").trim() || null;

  const row = {
    employee_id: employeeId,
    annual_salary_cents: Number.isFinite(annual_salary_cents as number) ? annual_salary_cents : null,
    currency,
    pay_frequency,
    bank_iban,
    hr_private_notes,
  };

  const { error } = await supabase.from("hr_employee_sensitive").upsert(row, { onConflict: "employee_id" });
  if (error) redirect(`/admin/hr/employees/${employeeId}?error=${encodeURIComponent(error.message)}&tab=hr`);
  revalidatePath(`/admin/hr/employees/${employeeId}`);
  redirect(`/admin/hr/employees/${employeeId}?success=sensitive&tab=hr`);
}

export async function createHrDepartment(formData: FormData) {
  const { supabase } = await requireHrSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/hr/employees?error=Nom+service+requis");
  const { error } = await supabase.from("hr_departments").insert({ name });
  if (error) redirect(`/admin/hr/employees?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/hr");
  revalidatePath("/admin/hr/employees");
  redirect("/admin/hr/employees?success=department");
}

export async function decideLeaveRequest(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const requestId = String(formData.get("request_id") ?? "").trim();
  const decision = String(formData.get("decision") ?? "").trim();
  const note = String(formData.get("decision_note") ?? "").trim() || null;
  const redirectTo = String(formData.get("redirect_to") ?? "/admin/hr/leave").trim();
  if (!requestId || (decision !== "approve" && decision !== "reject")) {
    redirect(`${redirectTo}?error=Décision+invalide`);
  }

  const { data: updated, error } = await supabase
    .from("hr_leave_requests")
    .update({
      status: decision === "approve" ? "approved" : "rejected",
      decided_by: user.id,
      decided_at: new Date().toISOString(),
      decision_note: note,
    })
    .eq("id", requestId)
    .eq("status", "pending")
    .select("id, employee_id, leave_type_id, starts_on, ends_on")
    .maybeSingle();

  if (error) redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);

  if (decision === "approve" && updated) {
    const balErr = await recordApprovedLeaveConsumption(supabase, {
      requestId: updated.id,
      employeeId: updated.employee_id,
      leaveTypeId: updated.leave_type_id,
      startsOn: updated.starts_on,
      endsOn: updated.ends_on,
      decidedBy: user.id,
    });
    if (balErr.error) redirect(`${redirectTo}?error=${encodeURIComponent(balErr.error)}`);
  }

  if (updated) {
    const { data: empRow } = await supabase
      .from("hr_employees")
      .select("user_id")
      .eq("id", updated.employee_id)
      .maybeSingle();
    if (empRow?.user_id) {
      await notifyUsers([empRow.user_id], {
        title: decision === "approve" ? "Congé approuvé" : "Congé refusé",
        body:
          decision === "approve"
            ? `Du ${updated.starts_on} au ${updated.ends_on}`
            : note || "Voir le détail dans votre espace congés.",
        link: "/employee/leave",
        kind: decision === "approve" ? "leave_approved" : "leave_rejected",
        metadata: { leave_request_id: updated.id, employee_id: updated.employee_id },
      });
    }
  }

  revalidatePath("/admin/hr");
  revalidatePath("/admin/hr/leave");
  revalidatePath("/employee/leave");
  revalidatePath("/employee/manager/leave");
  if (updated?.employee_id) {
    revalidatePath(`/admin/hr/employees/${updated.employee_id}`);
  }
  redirect(`${redirectTo}?success=leave`);
}

export async function adjustHrLeaveBalance(formData: FormData) {
  const { supabase, user } = await requireHrSession();
  const employeeId = String(formData.get("employee_id") ?? "").trim();
  const leave_type_id = String(formData.get("leave_type_id") ?? "").trim();
  const year = Number(String(formData.get("year") ?? "").trim());
  const deltaRaw = String(formData.get("delta_days") ?? "").trim();
  const justification = String(formData.get("justification") ?? "").trim();
  if (!employeeId || !leave_type_id || !justification || !Number.isFinite(year) || year < 2000 || year > 2100) {
    redirect(`/admin/hr/employees/${employeeId}?error=Données+invalides&tab=leave`);
  }
  const delta_days = Number(deltaRaw.replace(",", "."));
  if (!Number.isFinite(delta_days) || delta_days === 0) {
    redirect(`/admin/hr/employees/${employeeId}?error=Delta+jours+invalide&tab=leave`);
  }
  const err = await recordManualBalanceMovement(supabase, {
    employeeId,
    leaveTypeId: leave_type_id,
    year,
    deltaDays: delta_days,
    note: justification,
    createdBy: user.id,
  });
  if (err.error) redirect(`/admin/hr/employees/${employeeId}?error=${encodeURIComponent(err.error)}&tab=leave`);
  revalidatePath(`/admin/hr/employees/${employeeId}`);
  redirect(`/admin/hr/employees/${employeeId}?success=balance&tab=leave`);
}

export async function createHrAsset(formData: FormData) {
  const { supabase } = await requireHrSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/hr/assets?error=Nom+requis");
  const category = String(formData.get("category") ?? "").trim() || null;
  const serial_number = String(formData.get("serial_number") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const physical_condition = String(formData.get("physical_condition") ?? "").trim() || null;
  const warranty_expires = String(formData.get("warranty_expires") ?? "").trim() || null;
  const purchase_date = String(formData.get("purchase_date") ?? "").trim() || null;
  const { error } = await supabase.from("hr_assets").insert({
    name,
    category,
    serial_number,
    notes,
    physical_condition,
    warranty_expires: warranty_expires || null,
    purchase_date: purchase_date || null,
  });
  if (error) redirect(`/admin/hr/assets?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/hr/assets");
  redirect("/admin/hr/assets?success=asset");
}

export async function assignHrAsset(formData: FormData) {
  const { supabase } = await requireHrSession();
  const asset_id = String(formData.get("asset_id") ?? "").trim();
  const expected_return_on = String(formData.get("expected_return_on") ?? "").trim() || null;
  if (!asset_id) redirect("/admin/hr/assets?error=Champs+requis");

  const employeeId = await resolveEmployeeIdFromForm(supabase, formData);
  if (!employeeId) redirect("/admin/hr/assets?error=Collaborateur+requis");

  const { error: aErr } = await supabase.from("hr_asset_assignments").insert({
    asset_id,
    employee_id: employeeId,
    expected_return_on: expected_return_on || null,
  });
  if (aErr) redirect(`/admin/hr/assets?error=${encodeURIComponent(aErr.message)}`);

  const { error: sErr } = await supabase
    .from("hr_assets")
    .update({ status: "assigned" })
    .eq("id", asset_id);
  if (sErr) redirect(`/admin/hr/assets?error=${encodeURIComponent(sErr.message)}`);

  revalidatePath("/admin/hr/assets");
  redirect("/admin/hr/assets?success=assign");
}

export async function returnHrAsset(formData: FormData) {
  const { supabase } = await requireHrSession();
  const assignment_id = String(formData.get("assignment_id") ?? "").trim();
  const condition_in = String(formData.get("condition_in") ?? "").trim() || null;
  if (!assignment_id) redirect("/admin/hr/assets?error=Attribution+requis");

  const { data: row, error: fErr } = await supabase
    .from("hr_asset_assignments")
    .select("asset_id, returned_at")
    .eq("id", assignment_id)
    .single();
  if (fErr || !row || row.returned_at) redirect("/admin/hr/assets?error=Attribution+invalide");

  const { error: uErr } = await supabase
    .from("hr_asset_assignments")
    .update({ returned_at: new Date().toISOString(), condition_in })
    .eq("id", assignment_id);
  if (uErr) redirect(`/admin/hr/assets?error=${encodeURIComponent(uErr.message)}`);

  const { data: open } = await supabase
    .from("hr_asset_assignments")
    .select("id")
    .eq("asset_id", row.asset_id)
    .is("returned_at", null)
    .limit(1);

  if (!open?.length) {
    await supabase.from("hr_assets").update({ status: "available" }).eq("id", row.asset_id);
  }

  revalidatePath("/admin/hr/assets");
  redirect("/admin/hr/assets?success=return");
}

export async function uploadHrPayslip(formData: FormData) {
  const { supabase, user } = await requireHrSession();
  const period_start = String(formData.get("period_start") ?? "").trim();
  const period_end = String(formData.get("period_end") ?? "").trim();
  const file = formData.get("file") as File | null;
  const employeeId = await resolveEmployeeIdFromForm(supabase, formData);
  if (!employeeId || !period_start || !period_end || !file || file.size === 0) {
    redirect("/admin/hr/payroll?error=Fichier+période+et+employé+requis");
  }

  const path = `employees/${employeeId}/${randomUUID()}-${safeFileSegment(file.name)}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: file.type || "application/pdf",
    upsert: false,
  });
  if (upErr) redirect(`/admin/hr/payroll?error=${encodeURIComponent(upErr.message)}`);

  const { error: insErr } = await supabase.from("hr_payslips").insert({
    employee_id: employeeId,
    period_start,
    period_end,
    filename: file.name,
    storage_path: path,
    uploaded_by: user.id,
  });
  if (insErr) redirect(`/admin/hr/payroll?error=${encodeURIComponent(insErr.message)}`);

  revalidatePath("/admin/hr/payroll");
  revalidatePath(`/admin/hr/employees/${employeeId}`);
  redirect("/admin/hr/payroll?success=payslip");
}

export async function uploadHrEmployeeDocument(formData: FormData) {
  const { supabase, user } = await requireHrSession();
  const category = String(formData.get("category") ?? "").trim() || null;
  const visibility = String(formData.get("visibility") ?? "employee").trim();
  const vis =
    visibility === "manager" ? "manager" : visibility === "hr_only" ? "hr_only" : "employee";
  const expiresRaw = String(formData.get("expires_on") ?? "").trim();
  const expires_on = expiresRaw || null;
  const file = formData.get("file") as File | null;
  const employeeId = await resolveEmployeeIdFromForm(supabase, formData);
  if (!employeeId || !file || file.size === 0) {
    redirect("/admin/hr/employees?error=Document+invalide");
  }

  const path = `employees/${employeeId}/${randomUUID()}-${safeFileSegment(file.name)}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (upErr) redirect(`/admin/hr/employees/${employeeId}?error=${encodeURIComponent(upErr.message)}`);

  const { error: insErr } = await supabase.from("hr_employee_documents").insert({
    employee_id: employeeId,
    category,
    filename: file.name,
    storage_path: path,
    uploaded_by: user.id,
    visibility: vis,
    expires_on,
  });
  if (insErr) redirect(`/admin/hr/employees/${employeeId}?error=${encodeURIComponent(insErr.message)}&tab=documents`);

  revalidatePath(`/admin/hr/employees/${employeeId}`);
  redirect(`/admin/hr/employees/${employeeId}?success=document&tab=documents`);
}

export async function createHrTeam(formData: FormData) {
  const { supabase, user } = await requireHrSession();
  if (!consumeMutationBurst(`${user.id}:hr_create_team`, 12, 10_000)) {
    redirect(`/admin/hr/teams?error=${encodeURIComponent("Trop d'actions rapprochées. Patientez quelques secondes.")}`);
  }
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/hr/teams?error=Nom+requis");
  if (name.length > 200) {
    redirect(`/admin/hr/teams?error=${encodeURIComponent("Nom trop long (200 caractères max).")}`);
  }
  const description = String(formData.get("description") ?? "").trim() || null;
  if (description && description.length > 2000) {
    redirect(`/admin/hr/teams?error=${encodeURIComponent("Description trop longue.")}`);
  }

  const sinceIso = new Date(Date.now() - 8000).toISOString();
  const { data: recentSame } = await supabase
    .from("hr_teams")
    .select("id")
    .eq("name", name)
    .gte("created_at", sinceIso)
    .maybeSingle();
  if (recentSame?.id) {
    revalidatePath("/admin/hr/teams");
    redirect("/admin/hr/teams?success=team");
  }

  const { error } = await supabase.from("hr_teams").insert({ name, description });
  if (error) redirect(`/admin/hr/teams?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/hr/teams");
  redirect("/admin/hr/teams?success=team");
}

export type DeleteHrTeamResult = { ok: true } | { ok: false; error: string };

/** Deletes an HR team (memberships removed via DB ON DELETE CASCADE). HR session required. */
export async function deleteHrTeam(formData: FormData): Promise<DeleteHrTeamResult> {
  try {
    const { supabase, user } = await requireHrSession();
    if (!consumeMutationBurst(`${user.id}:hr_delete_team`, 8, 10_000)) {
      return { ok: false, error: "Trop de requêtes. Patientez quelques secondes." };
    }
    const team_id = String(formData.get("team_id") ?? "").trim();
    if (!team_id) return { ok: false, error: "Équipe requise." };

    const { error: dErr } = await supabase.from("hr_teams").delete().eq("id", team_id);
    if (dErr) return { ok: false, error: dErr.message };

    revalidatePath("/admin/hr/teams");
    revalidatePath(`/admin/hr/teams/${team_id}`);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    if (msg === "Unauthorized") return { ok: false, error: "Non authentifié." };
    if (msg === "Forbidden") return { ok: false, error: "Action non autorisée." };
    return { ok: false, error: msg };
  }
}

export async function addHrTeamMember(formData: FormData) {
  const { supabase, user } = await requireHrSession();
  if (!consumeMutationBurst(`${user.id}:hr_team_member`, 20, 10_000)) {
    redirect(`/admin/hr/teams?error=${encodeURIComponent("Trop d'actions rapprochées. Patientez quelques secondes.")}`);
  }
  const team_id = String(formData.get("team_id") ?? "").trim();
  const role = String(formData.get("member_role") ?? "member").trim();
  if (!team_id) redirect("/admin/hr/teams?error=Champs+requis");
  const memberRole = role === "manager" ? "manager" : "member";
  const employeeId = await resolveEmployeeIdFromForm(supabase, formData);
  if (!employeeId) redirect("/admin/hr/teams?error=Collaborateur+requis");
  const { error } = await supabase.from("hr_team_members").upsert(
    { team_id, employee_id: employeeId, role: memberRole },
    { onConflict: "team_id,employee_id" },
  );
  if (error) redirect(`/admin/hr/teams?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/hr/teams");
  redirect("/admin/hr/teams?success=member");
}

export async function addHrEducation(formData: FormData) {
  const { supabase } = await requireHrSession();
  const employeeId = await resolveEmployeeIdFromForm(supabase, formData);
  if (!employeeId) redirect("/admin/hr/employees?error=Fiche+requis");
  const institution = String(formData.get("institution") ?? "").trim() || null;
  const degree = String(formData.get("degree") ?? "").trim() || null;
  const field = String(formData.get("field") ?? "").trim() || null;
  const ended_on = String(formData.get("ended_on") ?? "").trim() || null;
  const { error } = await supabase.from("hr_employee_education").insert({
    employee_id: employeeId,
    institution,
    degree,
    field,
    ended_on,
  });
  if (error) redirect(`/admin/hr/employees/${employeeId}?error=${encodeURIComponent(error.message)}&tab=education`);
  revalidatePath(`/admin/hr/employees/${employeeId}`);
  redirect(`/admin/hr/employees/${employeeId}?success=education&tab=education`);
}

export async function addHrTrainingRecord(formData: FormData) {
  const { supabase } = await requireHrSession();
  const employeeId = await resolveEmployeeIdFromForm(supabase, formData);
  if (!employeeId) redirect("/admin/hr/employees?error=Fiche+requis");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect(`/admin/hr/employees/${employeeId}?error=Titre+requis&tab=education`);
  const provider = String(formData.get("provider") ?? "").trim() || null;
  const completed_on = String(formData.get("completed_on") ?? "").trim() || null;
  const { error } = await supabase.from("hr_training_records").insert({
    employee_id: employeeId,
    title,
    provider,
    completed_on,
  });
  if (error) redirect(`/admin/hr/employees/${employeeId}?error=${encodeURIComponent(error.message)}&tab=education`);
  revalidatePath(`/admin/hr/employees/${employeeId}`);
  redirect(`/admin/hr/employees/${employeeId}?success=training&tab=education`);
}
