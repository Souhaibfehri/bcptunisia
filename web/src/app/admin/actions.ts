"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { parseAppLocale } from "@/lib/appLocale";
import { getLocalizedAuthCallbackUrl } from "@/lib/serverPublicSite";
import { fetchInternalProjectMemberUserIds, notifyUsers } from "@/lib/notifications/server";
import { assertRecaptchaFromFormData } from "@/lib/recaptcha/serverForm";
import { consumeMutationBurst } from "@/lib/server/mutationBurst";

/** Full admin: super_admin / admin only — for user, client, and global management */
async function requireFullAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (error || !profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    throw new Error("Forbidden");
  }
  return supabase;
}

/** Any admin-level user (incl. project_manager) — for project-scoped actions */
async function requireStaffSupabase() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const adminRoles = ["admin", "super_admin", "project_manager"];
  if (error || !profile || !adminRoles.includes(profile.role)) {
    throw new Error("Forbidden");
  }
  return supabase;
}

/** Verifies user has admin-level access AND is a member of the given project (for project_manager scoping) */
async function requireProjectAccess(projectId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const adminRoles = ["admin", "super_admin", "project_manager"];
  if (error || !profile || !adminRoles.includes(profile.role)) {
    throw new Error("Forbidden");
  }
  if (profile.role === "project_manager") {
    const { data: membership } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();
    if (!membership) throw new Error("Forbidden — not assigned to this project");
  }
  return supabase;
}

async function guardProjectMutationBurst(projectId: string, supabase: Awaited<ReturnType<typeof requireProjectAccess>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirectProjectError(projectId, "Non authentifié");
  if (!consumeMutationBurst(`${user.id}:project:${projectId}`, 32, 12_000)) {
    redirectProjectError(projectId, "Trop d'actions rapprochées. Patientez quelques secondes.");
  }
}

function redirectError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function redirectProjectsError(message: string): never {
  redirectError("/admin/projects", message);
}

function redirectProjectError(projectId: string, message: string): never {
  redirect(`/admin/projects/${projectId}?error=${encodeURIComponent(message)}`);
}

/* ──────────────────── User / Client management ──────────────────── */

export async function updateUserRole(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const validRoles = [
    "super_admin",
    "admin",
    "hr_admin",
    "project_manager",
    "people_manager",
    "collaborator",
    "client",
  ];
  if (!userId || !validRoles.includes(role)) {
    redirectError("/admin/users", "Rôle invalide");
  }
  const supabase = await requireFullAdmin();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) redirectError("/admin/users", error.message);
  revalidatePath("/admin/users");
  redirect("/admin/users?success=role");
}

export async function updateUserCrmAccess(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "").trim();
  const redirectTo = String(formData.get("redirect_to") ?? "/admin/users").trim();
  if (!userId) redirectError(redirectTo, "Utilisateur requis");

  const enabled = String(formData.get("crm_access_enabled") ?? "") === "on";
  const scope = String(formData.get("crm_access_scope") ?? "none").trim();

  const supabase = await requireFullAdmin();
  const { data: target, error: fetchErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  if (fetchErr || !target) redirectError(redirectTo, "Profil introuvable");
  if (target.role === "client") redirectError(redirectTo, "Accès CRM impossible pour un compte client");

  let crm_access_enabled = false;
  let crm_access_scope: "none" | "assigned" | "org" = "none";
  if (enabled) {
    if (scope !== "assigned" && scope !== "org") {
      redirectError(redirectTo, "Périmètre CRM invalide");
    }
    crm_access_enabled = true;
    crm_access_scope = scope;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ crm_access_enabled, crm_access_scope })
    .eq("id", userId);
  if (error) redirectError(redirectTo, error.message);
  revalidatePath("/admin/users");
  revalidatePath(redirectTo);
  redirect(`${redirectTo}?success=crm`);
}

export async function linkUserToClient(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "").trim();
  const clientId = String(formData.get("client_id") ?? "").trim() || null;
  const redirectTo = String(formData.get("redirect_to") ?? "/admin/users").trim();
  if (!userId) redirectError(redirectTo, "Utilisateur requis");
  const supabase = await requireFullAdmin();
  const { error } = await supabase.from("profiles").update({ client_id: clientId }).eq("id", userId);
  if (error) redirectError(redirectTo, error.message);
  revalidatePath("/admin/users");
  revalidatePath("/admin/clients");
  redirect(`${redirectTo}?success=link`);
}

export async function unlinkUserFromClient(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "").trim();
  const redirectTo = String(formData.get("redirect_to") ?? "/admin/users").trim();
  if (!userId) redirectError(redirectTo, "Utilisateur requis");
  const supabase = await requireFullAdmin();
  const { error } = await supabase.from("profiles").update({ client_id: null }).eq("id", userId);
  if (error) redirectError(redirectTo, error.message);
  revalidatePath("/admin/users");
  revalidatePath("/admin/clients");
  redirect(`${redirectTo}?success=unlinked`);
}

export async function updateUserProfile(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "").trim();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const redirectTo = String(formData.get("redirect_to") ?? `/admin/users/${userId}`).trim();
  if (!userId || !displayName) redirectError(redirectTo, "Nom requis");
  const supabase = await requireFullAdmin();
  const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", userId);
  if (error) redirectError(redirectTo, error.message);
  revalidatePath("/admin/users");
  revalidatePath(redirectTo);
  redirect(`${redirectTo}?success=profile-updated`);
}

export async function inviteUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("display_name") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "client").trim();
  const clientId = String(formData.get("client_id") ?? "").trim() || null;
  const redirectTo = String(formData.get("redirect_to") ?? "/admin/users").trim();
  const authLocale = parseAppLocale(String(formData.get("auth_locale") ?? "").trim() || null);

  await assertRecaptchaFromFormData(formData, "INVITE_USER", redirectTo);

  if (!email) redirectError(redirectTo, "E-mail requis");

  await requireFullAdmin();
  const admin = createServiceRoleClient();

  const inviteRedirectTo = await getLocalizedAuthCallbackUrl(authLocale, "/portal/dashboard");
  if (!/^https?:\/\//i.test(inviteRedirectTo)) {
    redirectError(
      redirectTo,
      "URL publique manquante : définissez NEXT_PUBLIC_APP_URL (ou NEXT_PUBLIC_SITE_URL) sur le serveur.",
    );
  }

  const { data: inviteData, error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: displayName ?? undefined },
    redirectTo: inviteRedirectTo,
  });
  if (invErr) redirectError(redirectTo, invErr.message);

  if (inviteData?.user?.id) {
    const updates: Record<string, unknown> = { role };
    if (displayName) updates.display_name = displayName;
    if (clientId) updates.client_id = clientId;
    updates.invited_at = new Date().toISOString();
    await admin.from("profiles").update(updates).eq("id", inviteData.user.id);
  }

  revalidatePath("/admin/users");
  redirect(`${redirectTo}?success=invited`);
}

const MIN_DIRECT_PASSWORD_LEN = 12;

/** Create auth user + profile in one step (no invite email). Full admin only. */
export async function createUserDirect(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "collaborator").trim();
  const clientId = String(formData.get("client_id") ?? "").trim() || null;
  const redirectTo = String(formData.get("redirect_to") ?? "/admin/users").trim();

  await assertRecaptchaFromFormData(formData, "CREATE_USER", redirectTo);

  const validRoles = [
    "super_admin",
    "admin",
    "hr_admin",
    "project_manager",
    "people_manager",
    "collaborator",
    "client",
  ];
  if (!email) redirectError(redirectTo, "E-mail requis");
  if (password.length < MIN_DIRECT_PASSWORD_LEN) {
    redirectError(redirectTo, `Mot de passe : au moins ${MIN_DIRECT_PASSWORD_LEN} caractères`);
  }
  if (!validRoles.includes(role)) redirectError(redirectTo, "Rôle invalide");

  const supabase = await requireFullAdmin();
  const {
    data: { user: actor },
  } = await supabase.auth.getUser();
  const { data: actorProfile } = await supabase.from("profiles").select("role").eq("id", actor!.id).single();
  if (role === "super_admin" && actorProfile?.role !== "super_admin") {
    redirectError(redirectTo, "Seul un super admin peut créer un super admin");
  }

  const admin = createServiceRoleClient();
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: displayName ? { full_name: displayName } : undefined,
  });
  if (cErr) redirectError(redirectTo, cErr.message);
  if (!created.user?.id) redirectError(redirectTo, "Création impossible");

  const updates: Record<string, unknown> = { role, email };
  if (displayName) updates.display_name = displayName;
  updates.client_id = clientId;
  const { error: pErr } = await admin.from("profiles").update(updates).eq("id", created.user.id);
  if (pErr) redirectError(redirectTo, pErr.message);

  revalidatePath("/admin/users");
  redirect(`${redirectTo}?success=user-created`);
}

export async function deleteUser(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "").trim();
  const confirmEmail = String(formData.get("confirm_email") ?? "").trim().toLowerCase();
  const redirectTo = String(formData.get("redirect_to") ?? "/admin/users").trim() || "/admin/users";
  if (!userId || !confirmEmail) redirectError(redirectTo, "Confirmation requise");

  const supabase = await requireFullAdmin();

  const { data: target } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();
  if (!target || target.email?.toLowerCase() !== confirmEmail) {
    redirectError(redirectTo, "L'e-mail de confirmation ne correspond pas");
  }

  const admin = createServiceRoleClient();
  /** Remove RH fiche first so we do not leave orphan hr_employees rows when profile cascades on auth delete. */
  const { error: hrDelErr } = await admin.from("hr_employees").delete().eq("user_id", userId);
  if (hrDelErr) redirectError(redirectTo, hrDelErr.message);

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) redirectError(redirectTo, error.message);

  revalidatePath("/admin/users");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/hr/employees");
  /** Always return to the directory — the user detail URL would 404 after deletion. */
  redirect("/admin/users?success=user-deleted");
}

export async function assignProjectMemberById(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const userId = String(formData.get("user_id") ?? "").trim();
  const memberRole = String(formData.get("member_role") ?? "client_contact").trim();
  const redirectTo = String(formData.get("redirect_to") ?? `/admin/projects/${projectId}`).trim();
  if (!projectId || !userId) redirectError(redirectTo, "Champs requis");
  const supabase = await requireFullAdmin();
  const { error } = await supabase.from("project_members").upsert(
    { project_id: projectId, user_id: userId, role: memberRole },
    { onConflict: "project_id,user_id" },
  );
  if (error) redirectError(redirectTo, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/admin/users/${userId}`);
  redirect(`${redirectTo}?success=member`);
}

export async function updateProjectMemberPermission(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const userId = String(formData.get("user_id") ?? "").trim();
  const redirectTo = String(formData.get("redirect_to") ?? `/admin/projects/${projectId}`).trim();
  if (!projectId || !userId) redirectError(redirectTo, "Champs requis");
  const viewInvoices = String(formData.get("view_invoices") ?? "") === "1";
  const viewBudget = String(formData.get("view_budget") ?? "") === "1";
  const supabase = await requireFullAdmin();
  const { error } = await supabase.from("project_member_permissions").upsert(
    {
      project_id: projectId,
      user_id: userId,
      permissions: { view_invoices: viewInvoices, view_budget: viewBudget },
    },
    { onConflict: "project_id,user_id" },
  );
  if (error) redirectError(redirectTo, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`${redirectTo}?success=edited`);
}

/** Soft-archive: status archived. Full admin only; requires exact project name confirmation. */
export async function archiveProject(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const confirmName = String(formData.get("confirm_name") ?? "").trim();
  const redirectTo = String(formData.get("redirect_to") ?? `/admin/projects/${projectId}`).trim();
  if (!projectId || !confirmName) redirectError(redirectTo, "Confirmation requise");
  const supabase = await requireFullAdmin();
  const { data: proj } = await supabase.from("projects").select("name").eq("id", projectId).single();
  if (!proj || proj.name.trim() !== confirmName.trim()) {
    redirectError(redirectTo, "Le nom du projet ne correspond pas");
  }
  const { error } = await supabase.from("projects").update({ status: "archived" }).eq("id", projectId);
  if (error) redirectError(redirectTo, error.message);
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${projectId}`);
  redirect("/admin/projects?success=edited");
}

/* ──────────────────── Full project onboarding ──────────────────── */

export type WizardPayload = {
  client_id: string;
  new_client_name?: string;
  name: string;
  summary: string | null;
  objective: string | null;
  starts_on: string | null;
  ends_on: string | null;
  status: string;
  members: { email: string; role: string }[];
  milestones: { title: string; target_on: string | null }[];
  stages: { title: string; tasks: string[] }[];
};

export async function createProjectFull(formData: FormData) {
  const raw = String(formData.get("payload") ?? "{}");
  let payload: WizardPayload;
  try {
    payload = JSON.parse(raw) as WizardPayload;
  } catch {
    redirectProjectsError("Données invalides");
    return;
  }

  const supabase = await requireFullAdmin();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let clientId = payload.client_id;
  if (!clientId && payload.new_client_name?.trim()) {
    const { data: newClient, error: cErr } = await supabase
      .from("clients")
      .insert({ name: payload.new_client_name.trim() })
      .select("id")
      .single();
    if (cErr || !newClient) redirectProjectsError(cErr?.message ?? "Erreur création client");
    clientId = newClient!.id;
  }
  if (!clientId) redirectProjectsError("Client requis");

  const { data: project, error: pErr } = await supabase
    .from("projects")
    .insert({
      client_id: clientId,
      name: payload.name,
      summary: payload.summary || null,
      objective: payload.objective || null,
      starts_on: payload.starts_on || null,
      ends_on: payload.ends_on || null,
      status: payload.status || "active",
    })
    .select("id")
    .single();
  if (pErr || !project) redirectProjectsError(pErr?.message ?? "Erreur création projet");
  const projectId = project!.id;

  for (const m of payload.members) {
    const resolvedId = await resolveUserIdByEmail(supabase, m.email.toLowerCase().trim());
    if (resolvedId) {
      await supabase.from("project_members").upsert(
        { project_id: projectId, user_id: resolvedId, role: m.role || "client_contact" },
        { onConflict: "project_id,user_id" },
      );
    }
  }

  for (const ms of payload.milestones) {
    if (ms.title.trim()) {
      await supabase.from("project_milestones").insert({
        project_id: projectId,
        title: ms.title.trim(),
        target_on: ms.target_on || null,
        sort_order: payload.milestones.indexOf(ms),
      });
    }
  }

  for (let si = 0; si < payload.stages.length; si++) {
    const s = payload.stages[si];
    if (!s.title.trim()) continue;
    const { data: stage } = await supabase
      .from("project_stages")
      .insert({ project_id: projectId, title: s.title.trim(), sort_order: si })
      .select("id")
      .single();
    if (stage) {
      for (let ti = 0; ti < s.tasks.length; ti++) {
        const taskTitle = s.tasks[ti]?.trim();
        if (taskTitle) {
          await supabase.from("project_tasks").insert({
            stage_id: stage.id,
            title: taskTitle,
            sort_order: ti,
          });
        }
      }
    }
  }

  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${projectId}?success=project`);
}

/* ──────────────────── Client company ──────────────────── */

export async function createClientCompany(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirectProjectsError("Nom requis");
  const supabase = await requireFullAdmin();
  const { error } = await supabase.from("clients").insert({ name });
  if (error) redirectProjectsError(error.message);
  revalidatePath("/admin/projects");
  revalidatePath("/admin/clients");
  redirect("/admin/clients?success=client");
}

export async function updateClientCompany(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  if (!clientId || !name) redirectError("/admin/clients", "Nom requis");
  const supabase = await requireFullAdmin();
  const { error } = await supabase.from("clients").update({ name, notes }).eq("id", clientId);
  if (error) redirectError(`/admin/clients/${clientId}`, error.message);
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${clientId}?success=client-updated`);
}

export async function deleteClientCompany(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "").trim();
  if (!clientId) redirectError("/admin/clients", "Client requis");
  const supabase = await requireFullAdmin();
  await supabase.from("profiles").update({ client_id: null }).eq("client_id", clientId);
  const { error } = await supabase.from("clients").delete().eq("id", clientId);
  if (error) redirectError("/admin/clients", error.message);
  revalidatePath("/admin/clients");
  redirect("/admin/clients?success=client-deleted");
}

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const clientId = String(formData.get("client_id") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  if (!name || !clientId) redirectProjectsError("Champs requis");
  const supabase = await requireFullAdmin();
  // Do not send created_by here: live DBs that never ran
  // supabase/migrations/20250405120000_align_projects_created_by.sql will reject the insert
  // with "Could not find the 'created_by' column in the schema cache". After that SQL (or full
  // portal_schema migration) is applied, you can add created_by back for audit if desired.
  const { error } = await supabase.from("projects").insert({
    name,
    client_id: clientId,
    summary,
    status: "active",
  });
  if (error) redirectProjectsError(error.message);
  revalidatePath("/admin/projects");
  redirect("/admin/projects?success=project");
}

async function resolveUserIdByEmail(
  supabase: Awaited<ReturnType<typeof requireProjectAccess>>,
  email: string,
) {
  const { data } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
  return data?.id ?? null;
}

export async function assignProjectMemberByEmail(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const memberRole = String(formData.get("member_role") ?? "client_contact").trim();
  if (!projectId || !email) redirectProjectsError("Champs requis");
  const supabase = await requireProjectAccess(projectId);
  const userId = await resolveUserIdByEmail(supabase, email);
  if (!userId) {
    redirectProjectError(
      projectId,
      "Aucun profil avec cet e-mail. L'utilisateur doit s'inscrire d'abord.",
    );
  }
  const { error } = await supabase.from("project_members").upsert(
    {
      project_id: projectId,
      user_id: userId,
      role: memberRole,
    },
    { onConflict: "project_id,user_id" },
  );
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=member`);
}

export async function removeProjectMember(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const userId = String(formData.get("user_id") ?? "").trim();
  if (!projectId || !userId) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=deleted`);
}

export async function assignTask(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const taskId = String(formData.get("task_id") ?? "").trim();
  const assignedTo = String(formData.get("assigned_to") ?? "").trim() || null;
  if (!projectId || !taskId) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: task } = await supabase
    .from("project_tasks")
    .select("assigned_to, title")
    .eq("id", taskId)
    .maybeSingle();
  const { error } = await supabase
    .from("project_tasks")
    .update({ assigned_to: assignedTo })
    .eq("id", taskId);
  if (error) redirectProjectError(projectId, error.message);
  if (assignedTo && assignedTo !== task?.assigned_to && user && assignedTo !== user.id) {
    const admin = createServiceRoleClient();
    const { data: proj } = await admin.from("projects").select("name").eq("id", projectId).maybeSingle();
    await notifyUsers([assignedTo], {
      kind: "project_task_assigned",
      title: "Tâche assignée",
      body: `${proj?.name ?? "Projet"} — ${task?.title ?? "Tâche"}`,
      link: `/admin/projects/${projectId}`,
      actor_user_id: user.id,
      entity_type: "project_task",
      entity_id: taskId,
      metadata: { project_id: projectId, task_id: taskId },
    });
  }
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=assigned`);
}

export async function addProjectUpdate(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim() || null;
  const visible = formData.get("visible_to_client") === "on";
  if (!projectId || !title) redirectProjectError(projectId || "unknown", "Titre requis");
  const supabase = await requireProjectAccess(projectId);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("project_updates").insert({
    project_id: projectId,
    title,
    body,
    visible_to_client: visible,
    created_by: user?.id ?? null,
  });
  if (error) redirectProjectError(projectId, error.message);

  const admin = createServiceRoleClient();
  const { data: proj } = await admin.from("projects").select("name, client_id").eq("id", projectId).maybeSingle();

  const internalIds = (await fetchInternalProjectMemberUserIds(projectId)).filter((id) => id !== user?.id);
  if (internalIds.length > 0) {
    await notifyUsers(internalIds, {
      title: `Mise à jour projet — ${proj?.name ?? "Projet"}`,
      body: title,
      link: `/admin/projects/${projectId}`,
      kind: "project_update_internal",
      actor_user_id: user?.id ?? null,
      entity_type: "project",
      entity_id: projectId,
      metadata: { project_id: projectId, visible_to_client: visible },
    });
  }

  if (visible && proj?.client_id) {
    const { data: clientUsers } = await admin
      .from("profiles")
      .select("id")
      .eq("client_id", proj.client_id)
      .eq("role", "client");
    const ids = (clientUsers ?? []).map((r) => r.id);
    await notifyUsers(ids, {
      title: `Actualité — ${proj.name ?? "Projet"}`,
      body: title,
      link: `/portal/projects/${projectId}`,
      kind: "project_update",
      actor_user_id: user?.id ?? null,
      entity_type: "project",
      entity_id: projectId,
      metadata: { project_id: projectId },
    });
  }

  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=update`);
}

export async function createInvoice(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const invoiceNumber = String(formData.get("invoice_number") ?? "").trim();
  const amountTnd = String(formData.get("amount_tnd") ?? "").trim();
  const dueRaw = String(formData.get("due_on") ?? "").trim();
  if (!projectId || !invoiceNumber || !amountTnd) {
    redirectProjectError(projectId || "unknown", "Numéro et montant requis");
  }
  const amount = Number.parseFloat(amountTnd.replace(",", "."));
  if (Number.isNaN(amount) || amount < 0) {
    redirectProjectError(projectId, "Montant invalide");
  }
  const amountCents = Math.round(amount * 100);
  const supabase = await requireProjectAccess(projectId);
  await guardProjectMutationBurst(projectId, supabase);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("invoices").insert({
    project_id: projectId,
    invoice_number: invoiceNumber,
    title: invoiceNumber,
    amount_cents: amountCents,
    amount_paid_cents: 0,
    currency: "TND",
    status: (String(formData.get("status") ?? "").trim() || "sent") as string,
    due_on: dueRaw || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    created_by: user?.id ?? null,
  });
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=invoice`);
}

export async function updateInvoiceStatus(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const invoiceId = String(formData.get("invoice_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!projectId || !invoiceId || !status) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  const update: Record<string, unknown> = { status };
  if (status === "paid") {
    update.paid_at = new Date().toISOString();
    const { data: inv } = await supabase.from("invoices").select("amount_cents").eq("id", invoiceId).single();
    if (inv) update.amount_paid_cents = inv.amount_cents;
  }
  if (status === "cancelled") update.paid_at = null;
  const { error } = await supabase.from("invoices").update(update).eq("id", invoiceId);
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=status`);
}

export async function addInvoicePayment(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const invoiceId = String(formData.get("invoice_id") ?? "").trim();
  const paymentTnd = String(formData.get("amount_tnd") ?? "").trim();
  const paidOn = String(formData.get("paid_on") ?? "").trim();
  const method = String(formData.get("method") ?? "").trim() || null;
  const reference = String(formData.get("reference") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!projectId || !invoiceId || !paymentTnd)
    redirectProjectError(projectId || "unknown", "Champs requis");

  const payment = Number.parseFloat(paymentTnd.replace(",", "."));
  if (Number.isNaN(payment) || payment <= 0)
    redirectProjectError(projectId, "Montant invalide");

  const paymentCents = Math.round(payment * 100);
  const supabase = await requireProjectAccess(projectId);
  await guardProjectMutationBurst(projectId, supabase);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error: payErr } = await supabase.from("invoice_payments").insert({
    invoice_id: invoiceId,
    amount_cents: paymentCents,
    paid_on: paidOn || new Date().toISOString().slice(0, 10),
    method,
    reference,
    notes,
    recorded_by: user?.id ?? null,
  });
  if (payErr) redirectProjectError(projectId, payErr.message);

  await recalcInvoicePaid(supabase, invoiceId, projectId);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=payment`);
}

export async function deleteInvoicePayment(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const invoiceId = String(formData.get("invoice_id") ?? "").trim();
  const paymentId = String(formData.get("payment_id") ?? "").trim();
  if (!projectId || !invoiceId || !paymentId)
    redirectProjectError(projectId || "unknown", "Champs requis");

  const supabase = await requireProjectAccess(projectId);
  const { error } = await supabase
    .from("invoice_payments")
    .delete()
    .eq("id", paymentId)
    .eq("invoice_id", invoiceId);
  if (error) redirectProjectError(projectId, error.message);

  await recalcInvoicePaid(supabase, invoiceId, projectId);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=payment-deleted`);
}

async function recalcInvoicePaid(
  supabase: Awaited<ReturnType<typeof requireProjectAccess>>,
  invoiceId: string,
  projectId: string,
) {
  const { data: payments } = await supabase
    .from("invoice_payments")
    .select("amount_cents")
    .eq("invoice_id", invoiceId);

  const totalPaid = (payments ?? []).reduce((s, p) => s + (p.amount_cents ?? 0), 0);

  const { data: inv } = await supabase
    .from("invoices")
    .select("amount_cents, status")
    .eq("id", invoiceId)
    .single();

  if (!inv) return;

  const currentStatus = String(inv.status ?? "");
  const update: Record<string, unknown> = { amount_paid_cents: totalPaid };
  if (totalPaid >= inv.amount_cents) {
    update.status = "paid";
    update.paid_at = new Date().toISOString();
  } else if (totalPaid > 0) {
    update.status = "partially_paid";
    update.paid_at = null;
  } else {
    update.paid_at = null;
    if (currentStatus === "paid" || currentStatus === "partially_paid") {
      update.status = "sent";
    }
  }

  const { error } = await supabase.from("invoices").update(update).eq("id", invoiceId);
  if (error) redirectProjectError(projectId, error.message);
}

export async function deleteInvoice(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const invoiceId = String(formData.get("invoice_id") ?? "").trim();
  if (!projectId || !invoiceId) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  const { error } = await supabase.from("invoices").delete().eq("id", invoiceId);
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=deleted`);
}

export async function uploadProjectDocument(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const rawFile = formData.get("file");
  const visible = formData.get("visible_to_client") === "on";
  const category = String(formData.get("category") ?? "").trim() || null;
  if (!projectId || !rawFile || !(rawFile instanceof File) || rawFile.size === 0) {
    redirectProjectError(projectId || "unknown", "Fichier requis");
  }
  const file = rawFile;
  const supabase = await requireProjectAccess(projectId);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const safeName = file.name.replace(/[^\w.\-]/g, "_");
  const storagePath = `${projectId}/${Date.now()}-${safeName}`;
  const { error: upErr } = await supabase.storage.from("project-documents").upload(storagePath, file, {
    contentType: file.type || "application/octet-stream",
  });
  if (upErr) redirectProjectError(projectId, upErr.message);
  const { error: insErr } = await supabase.from("project_documents").insert({
    project_id: projectId,
    storage_path: storagePath,
    filename: file.name,
    file_name: file.name,
    title: file.name,
    mime_type: file.type || null,
    category,
    visible_to_client: visible,
    uploaded_by: user?.id ?? null,
  });
  if (insErr) redirectProjectError(projectId, insErr.message);

  if (visible) {
    const admin = createServiceRoleClient();
    const { data: proj } = await admin.from("projects").select("name, client_id").eq("id", projectId).maybeSingle();
    if (proj?.client_id) {
      const { data: clientUsers } = await admin
        .from("profiles")
        .select("id")
        .eq("client_id", proj.client_id)
        .eq("role", "client");
      const ids = (clientUsers ?? []).map((r) => r.id);
      await notifyUsers(ids, {
        title: `Nouveau document — ${proj.name ?? "Projet"}`,
        body: file.name,
        link: `/portal/projects/${projectId}`,
        kind: "project_document",
        metadata: { project_id: projectId, filename: file.name },
      });
    }
  }

  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=document`);
}

export async function addStage(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!projectId || !title) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  await guardProjectMutationBurst(projectId, supabase);

  const sinceIso = new Date(Date.now() - 3500).toISOString();
  const { data: dupStage } = await supabase
    .from("project_stages")
    .select("id")
    .eq("project_id", projectId)
    .eq("title", title)
    .gte("created_at", sinceIso)
    .maybeSingle();
  if (dupStage?.id) {
    revalidatePath(`/admin/projects/${projectId}`);
    redirect(`/admin/projects/${projectId}?success=stage`);
  }

  const { data: rows } = await supabase
    .from("project_stages")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = (rows?.[0]?.sort_order ?? -1) + 1;
  const { error } = await supabase.from("project_stages").insert({
    project_id: projectId,
    title,
    sort_order: nextOrder,
  });
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=stage`);
}

export async function addTask(formData: FormData) {
  const stageId = String(formData.get("stage_id") ?? "").trim();
  const projectId = String(formData.get("project_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!stageId || !projectId || !title) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  await guardProjectMutationBurst(projectId, supabase);

  const sinceIso = new Date(Date.now() - 3500).toISOString();
  const { data: dupTask } = await supabase
    .from("project_tasks")
    .select("id")
    .eq("stage_id", stageId)
    .eq("title", title)
    .gte("created_at", sinceIso)
    .maybeSingle();
  if (dupTask?.id) {
    revalidatePath(`/admin/projects/${projectId}`);
    redirect(`/admin/projects/${projectId}?success=task`);
  }

  const { data: rows } = await supabase
    .from("project_tasks")
    .select("sort_order")
    .eq("stage_id", stageId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = (rows?.[0]?.sort_order ?? -1) + 1;
  const { error } = await supabase.from("project_tasks").insert({
    stage_id: stageId,
    title,
    sort_order: nextOrder,
  });
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=task`);
}

export async function addSubtask(formData: FormData) {
  const taskId = String(formData.get("task_id") ?? "").trim();
  const projectId = String(formData.get("project_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!taskId || !projectId || !title) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  await guardProjectMutationBurst(projectId, supabase);

  const sinceIso = new Date(Date.now() - 3500).toISOString();
  const { data: dupSub } = await supabase
    .from("project_subtasks")
    .select("id")
    .eq("task_id", taskId)
    .eq("title", title)
    .gte("created_at", sinceIso)
    .maybeSingle();
  if (dupSub?.id) {
    revalidatePath(`/admin/projects/${projectId}`);
    redirect(`/admin/projects/${projectId}?success=subtask`);
  }

  const { data: rows } = await supabase
    .from("project_subtasks")
    .select("sort_order")
    .eq("task_id", taskId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = (rows?.[0]?.sort_order ?? -1) + 1;
  const { error } = await supabase.from("project_subtasks").insert({
    task_id: taskId,
    title,
    sort_order: nextOrder,
  });
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=subtask`);
}

export async function reorderProjectStages(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const orderJson = String(formData.get("ordered_stage_ids") ?? "[]");
  let orderedIds: string[];
  try {
    orderedIds = JSON.parse(orderJson) as string[];
  } catch {
    redirectProjectError(projectId || "unknown", "Ordre invalide");
    return;
  }
  const supabase = await requireProjectAccess(projectId);
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("project_stages")
      .update({ sort_order: i })
      .eq("id", orderedIds[i])
      .eq("project_id", projectId);
    if (error) redirectProjectError(projectId, error.message);
  }
  revalidatePath(`/admin/projects/${projectId}`);
  return;
}

export async function reorderTasksInStage(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const stageId = String(formData.get("stage_id") ?? "").trim();
  const orderJson = String(formData.get("ordered_task_ids") ?? "[]");
  let orderedIds: string[];
  try {
    orderedIds = JSON.parse(orderJson) as string[];
  } catch {
    redirectProjectError(projectId || "unknown", "Ordre invalide");
    return;
  }
  const supabase = await requireProjectAccess(projectId);
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("project_tasks")
      .update({ sort_order: i, stage_id: stageId })
      .eq("id", orderedIds[i])
      .eq("stage_id", stageId);
    if (error) redirectProjectError(projectId, error.message);
  }
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function moveTaskToStage(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const taskId = String(formData.get("task_id") ?? "").trim();
  const newStageId = String(formData.get("new_stage_id") ?? "").trim();
  const orderJson = String(formData.get("ordered_task_ids_in_target") ?? "[]");
  const sourceStageId = String(formData.get("source_stage_id") ?? "").trim();
  const sourceOrderJson = String(formData.get("ordered_task_ids_in_source") ?? "[]");
  let orderedIds: string[];
  let sourceOrderedIds: string[];
  try {
    orderedIds = JSON.parse(orderJson) as string[];
    sourceOrderedIds = JSON.parse(sourceOrderJson) as string[];
  } catch {
    redirectProjectError(projectId || "unknown", "Ordre invalide");
    return;
  }
  if (!projectId || !taskId || !newStageId) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  const { error: moveErr } = await supabase
    .from("project_tasks")
    .update({ stage_id: newStageId })
    .eq("id", taskId);
  if (moveErr) redirectProjectError(projectId, moveErr.message);
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("project_tasks")
      .update({ sort_order: i, stage_id: newStageId })
      .eq("id", orderedIds[i]);
    if (error) redirectProjectError(projectId, error.message);
  }
  if (sourceStageId && sourceStageId !== newStageId) {
    for (let i = 0; i < sourceOrderedIds.length; i++) {
      const { error } = await supabase
        .from("project_tasks")
        .update({ sort_order: i })
        .eq("id", sourceOrderedIds[i])
        .eq("stage_id", sourceStageId);
      if (error) redirectProjectError(projectId, error.message);
    }
  }
  revalidatePath(`/admin/projects/${projectId}`);
  return;
}

/* ──────────────────── Status updates ──────────────────── */

export async function updateProjectStatus(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!projectId || !status) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  const { error } = await supabase.from("projects").update({ status }).eq("id", projectId);
  if (error) redirectProjectError(projectId, error.message);

  const admin = createServiceRoleClient();
  const { data: proj } = await admin.from("projects").select("name, client_id").eq("id", projectId).maybeSingle();
  if (proj?.client_id) {
    const { data: clientUsers } = await admin
      .from("profiles")
      .select("id")
      .eq("client_id", proj.client_id)
      .eq("role", "client");
    const ids = (clientUsers ?? []).map((r) => r.id);
    await notifyUsers(ids, {
      title: `Projet « ${proj.name ?? "Projet"} »`,
      body: `Statut : ${status}`,
      link: `/portal/projects/${projectId}`,
      kind: "project_status",
      metadata: { project_id: projectId, status },
    });
  }

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${projectId}?success=status`);
}

export async function updateTaskStatus(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const taskId = String(formData.get("task_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!projectId || !taskId || !status) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  const update: Record<string, unknown> = { status };
  if (status === "completed") update.completed_at = new Date().toISOString();
  const { error } = await supabase.from("project_tasks").update(update).eq("id", taskId);
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=status`);
}

export async function updateStageStatus(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const stageId = String(formData.get("stage_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const progressRaw = String(formData.get("progress_percent") ?? "").trim();
  if (!projectId || !stageId) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  const update: Record<string, unknown> = {};
  if (status) update.status = status;
  if (progressRaw !== "") update.progress_percent = Math.min(100, Math.max(0, parseInt(progressRaw) || 0));
  if (status === "completed") update.completed_at = new Date().toISOString();
  const { error } = await supabase.from("project_stages").update(update).eq("id", stageId);
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=status`);
}

/* ──────────────────── Milestones ──────────────────── */

export async function addMilestone(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const targetOn = String(formData.get("target_on") ?? "").trim() || null;
  if (!projectId || !title) redirectProjectError(projectId || "unknown", "Titre requis");
  const supabase = await requireProjectAccess(projectId);
  await guardProjectMutationBurst(projectId, supabase);

  const sinceIso = new Date(Date.now() - 3500).toISOString();
  const msBase = supabase
    .from("project_milestones")
    .select("id")
    .eq("project_id", projectId)
    .eq("title", title)
    .gte("created_at", sinceIso);
  const { data: dupMs } = await (targetOn ? msBase.eq("target_on", targetOn) : msBase.is("target_on", null)).maybeSingle();
  if (dupMs?.id) {
    revalidatePath(`/admin/projects/${projectId}`);
    redirect(`/admin/projects/${projectId}?success=milestone`);
  }

  const { data: rows } = await supabase
    .from("project_milestones")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = (rows?.[0]?.sort_order ?? -1) + 1;
  const { error } = await supabase.from("project_milestones").insert({
    project_id: projectId,
    title,
    target_on: targetOn,
    sort_order: nextOrder,
  });
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=milestone`);
}

export async function toggleMilestoneAchieved(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const milestoneId = String(formData.get("milestone_id") ?? "").trim();
  const achieved = formData.get("achieved") === "true";
  if (!projectId || !milestoneId) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  const { error } = await supabase
    .from("project_milestones")
    .update({ achieved_at: achieved ? new Date().toISOString() : null })
    .eq("id", milestoneId);
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=milestone`);
}

/* ──────────────────── Stage / Task / Subtask / Milestone CRUD ──────────────────── */

export async function editStage(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const stageId = String(formData.get("stage_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const dueOn = String(formData.get("due_on") ?? "").trim() || null;
  if (!projectId || !stageId || !title) redirectProjectError(projectId || "unknown", "Titre requis");
  const supabase = await requireProjectAccess(projectId);
  const { error } = await supabase.from("project_stages").update({ title, description, due_on: dueOn }).eq("id", stageId);
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=edited`);
}

export async function deleteStage(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const stageId = String(formData.get("stage_id") ?? "").trim();
  if (!projectId || !stageId) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  const { error } = await supabase.from("project_stages").delete().eq("id", stageId);
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=deleted`);
}

export async function editTask(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const taskId = String(formData.get("task_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const dueOn = String(formData.get("due_on") ?? "").trim() || null;
  if (!projectId || !taskId || !title) redirectProjectError(projectId || "unknown", "Titre requis");
  const supabase = await requireProjectAccess(projectId);
  const { error } = await supabase.from("project_tasks").update({ title, description, due_on: dueOn }).eq("id", taskId);
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=edited`);
}

export async function deleteTask(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const taskId = String(formData.get("task_id") ?? "").trim();
  if (!projectId || !taskId) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  const { error } = await supabase.from("project_tasks").delete().eq("id", taskId);
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=deleted`);
}

export async function editSubtask(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const subtaskId = String(formData.get("subtask_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!projectId || !subtaskId || !title) redirectProjectError(projectId || "unknown", "Titre requis");
  const supabase = await requireProjectAccess(projectId);
  const { error } = await supabase.from("project_subtasks").update({ title }).eq("id", subtaskId);
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=edited`);
}

export async function deleteSubtask(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const subtaskId = String(formData.get("subtask_id") ?? "").trim();
  if (!projectId || !subtaskId) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  const { error } = await supabase.from("project_subtasks").delete().eq("id", subtaskId);
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=deleted`);
}

export async function updateSubtaskStatus(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const subtaskId = String(formData.get("subtask_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!projectId || !subtaskId || !status) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  const update: Record<string, unknown> = { status };
  if (status === "completed") update.completed_at = new Date().toISOString();
  const { error } = await supabase.from("project_subtasks").update(update).eq("id", subtaskId);
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=status`);
}

export async function editMilestone(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const milestoneId = String(formData.get("milestone_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const targetOn = String(formData.get("target_on") ?? "").trim() || null;
  if (!projectId || !milestoneId || !title) redirectProjectError(projectId || "unknown", "Titre requis");
  const supabase = await requireProjectAccess(projectId);
  const { error } = await supabase.from("project_milestones").update({ title, target_on: targetOn }).eq("id", milestoneId);
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=edited`);
}

export async function deleteMilestone(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const milestoneId = String(formData.get("milestone_id") ?? "").trim();
  if (!projectId || !milestoneId) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  const { error } = await supabase.from("project_milestones").delete().eq("id", milestoneId);
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=deleted`);
}

/* ──────────────────── Document delete ──────────────────── */

export async function deleteProjectDocument(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const docId = String(formData.get("doc_id") ?? "").trim();
  const storagePath = String(formData.get("storage_path") ?? "").trim();
  if (!projectId || !docId) redirectProjectError(projectId || "unknown", "Champs requis");
  const supabase = await requireProjectAccess(projectId);
  if (storagePath) {
    await supabase.storage.from("project-documents").remove([storagePath]);
  }
  const { error } = await supabase.from("project_documents").delete().eq("id", docId);
  if (error) redirectProjectError(projectId, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?success=deleted`);
}
