"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getProfile,
  canAccessAdminCrm,
  canAccessEmployeeCrm,
} from "@/lib/supabase/auth";
import {
  notifyLeadAssigned,
  notifyLeadPriorityHigh,
  notifyLeadStageMilestone,
} from "@/lib/crm/notifyRecipients";
import { CRM_STAGES, type CrmStage } from "@/lib/crm/types";

type CrmActor = { isAdminCrm: boolean };

async function requireCrmActor(): Promise<CrmActor> {
  const profile = await getProfile();
  if (!profile) throw new Error("Unauthorized");
  if (canAccessAdminCrm(profile.role)) {
    return { isAdminCrm: true };
  }
  const supabase = await createServerSupabaseClient();
  const { data: emp } = await supabase
    .from("hr_employees")
    .select("portal_status")
    .eq("user_id", profile.id)
    .maybeSingle();
  const portalOk = emp?.portal_status === "active";
  if (canAccessEmployeeCrm(profile, { employeePortalActive: portalOk })) {
    return { isAdminCrm: false };
  }
  throw new Error("Forbidden");
}

function revalidateCrmPaths() {
  revalidatePath("/admin/leads");
  revalidatePath("/employee/leads");
}

function revalidateLeadDetail(leadId: string) {
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath(`/employee/leads/${leadId}`);
}

function isValidTargetStage(s: string): s is CrmStage {
  return (CRM_STAGES as readonly string[]).includes(s);
}

function crmBasePath(raw: string): "/admin/leads" | "/employee/leads" {
  const t = raw.trim();
  if (t === "/employee/leads") return "/employee/leads";
  return "/admin/leads";
}

function isNextRedirect(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "digest" in e &&
    typeof (e as { digest: unknown }).digest === "string" &&
    String((e as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

function priorityLabelFr(p: string): string {
  const m: Record<string, string> = {
    low: "Basse",
    normal: "Normale",
    high: "Haute",
    urgent: "Urgente",
  };
  return m[p] ?? p;
}

function formatFollowUpFr(iso: string | null): string {
  if (!iso) return "Aucun";
  try {
    return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

/** Minute-level key to avoid spurious activity rows on datetime precision mismatch */
function followUpKey(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}`;
}

async function profileShortLabel(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string | null,
): Promise<string> {
  if (!userId) return "Non assigné";
  const { data } = await supabase.from("profiles").select("display_name, email").eq("id", userId).maybeSingle();
  const d = data as { display_name: string | null; email: string | null } | null;
  return d?.display_name?.trim() || d?.email?.trim() || `${userId.slice(0, 8)}…`;
}

/** Client-callable (e.g. kanban drag). */
export async function moveCrmLeadStage(leadId: string, toStage: string) {
  await requireCrmActor();
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: lead, error: gErr } = await supabase
    .from("crm_leads")
    .select("id, stage, title, assigned_to")
    .eq("id", leadId)
    .single();
  if (gErr || !lead) throw new Error("Lead introuvable");

  const fromStage = lead.stage;
  let normalized = toStage === "proposal" ? "proposal_sent" : toStage;
  if (!isValidTargetStage(normalized)) throw new Error("Étape invalide");

  const fromNorm = fromStage === "proposal" ? "proposal_sent" : fromStage;
  if (fromNorm === normalized) {
    revalidateCrmPaths();
    revalidateLeadDetail(leadId);
    return;
  }

  const patch: Record<string, unknown> = { stage: normalized };
  const nowIso = new Date().toISOString();
  if (normalized === "won") patch.won_at = nowIso;
  if (normalized === "lost") patch.lost_at = nowIso;
  if (normalized === "contacted") patch.last_contact_at = nowIso;

  const { error: uErr } = await supabase.from("crm_leads").update(patch).eq("id", leadId);
  if (uErr) throw new Error(uErr.message);

  const { error: e1 } = await supabase.from("crm_lead_stage_events").insert({
    lead_id: leadId,
    from_stage: fromStage,
    to_stage: normalized,
    actor_id: user.id,
  });
  if (e1) throw new Error(e1.message);

  const { error: e2 } = await supabase.from("crm_lead_activities").insert({
    lead_id: leadId,
    author_id: user.id,
    kind: "stage_change",
    body: `${fromStage} → ${normalized}`,
  });
  if (e2) throw new Error(e2.message);

  await notifyLeadStageMilestone({
    assigneeId: lead.assigned_to ?? null,
    leadId,
    title: lead.title,
    actorId: user.id,
    toStage: normalized,
  }).catch(() => {});

  revalidateCrmPaths();
  revalidateLeadDetail(leadId);
}

export async function createCrmLead(formData: FormData) {
  const actor = await requireCrmActor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Titre requis");

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const company_name = String(formData.get("company_name") ?? "").trim() || null;
  const contact_name = String(formData.get("contact_name") ?? "").trim() || null;
  const contact_email = String(formData.get("contact_email") ?? "").trim() || null;
  const contact_phone = String(formData.get("contact_phone") ?? "").trim() || null;
  const stage = String(formData.get("stage") ?? "new").trim() || "new";
  let assigned_to = String(formData.get("assigned_to") ?? "").trim() || null;

  if (!actor.isAdminCrm) {
    assigned_to = user.id;
  } else if (assigned_to === "") {
    assigned_to = null;
  }

  const { data, error } = await supabase
    .from("crm_leads")
    .insert({
      title,
      company_name,
      contact_name,
      contact_email,
      contact_phone,
      stage,
      assigned_to,
      created_by: user.id,
      status: "open",
      priority: "normal",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  if (data?.id) {
    await supabase.from("crm_lead_activities").insert({
      lead_id: data.id,
      author_id: user.id,
      kind: "lead_created",
      body: `Lead créé : ${title}`,
    });
    revalidateLeadDetail(data.id);
  }
  revalidateCrmPaths();
  if (actor.isAdminCrm && assigned_to && data?.id) {
    await notifyLeadAssigned(assigned_to, data.id, title, user.id).catch(() => {});
  }
  return data?.id ?? null;
}

export async function updateCrmLead(formData: FormData) {
  const actor = await requireCrmActor();
  const leadId = String(formData.get("lead_id") ?? "").trim();
  if (!leadId) throw new Error("Lead manquant");

  const title = String(formData.get("title") ?? "").trim();
  const company_name = String(formData.get("company_name") ?? "").trim() || null;
  const contact_name = String(formData.get("contact_name") ?? "").trim() || null;
  const contact_email = String(formData.get("contact_email") ?? "").trim() || null;
  const contact_phone = String(formData.get("contact_phone") ?? "").trim() || null;
  let stage = String(formData.get("stage") ?? "new").trim() || "new";
  if (stage === "proposal") stage = "proposal_sent";
  const assignedRaw = String(formData.get("assigned_to") ?? "").trim();
  const priority = String(formData.get("priority") ?? "normal").trim() || "normal";
  const status = String(formData.get("status") ?? "open").trim() || "open";
  const internal_notes = String(formData.get("internal_notes") ?? "").trim() || null;
  const lost_reason = String(formData.get("lost_reason") ?? "").trim() || null;
  const followRaw = String(formData.get("follow_up_at") ?? "").trim();
  const follow_up_at = followRaw === "" ? null : new Date(followRaw).toISOString();

  if (!title) throw new Error("Titre requis");

  const supabase = await createServerSupabaseClient();
  const { data: prev } = await supabase
    .from("crm_leads")
    .select("assigned_to, stage, title, priority, follow_up_at")
    .eq("id", leadId)
    .single();

  const {
    data: { user: actorUser },
  } = await supabase.auth.getUser();

  const patch: Record<string, unknown> = {
    title,
    company_name,
    contact_name,
    contact_email,
    contact_phone,
    stage,
    priority,
    status,
    internal_notes,
    lost_reason,
    follow_up_at,
  };
  let newAssignee: string | null | undefined;
  if (actor.isAdminCrm) {
    newAssignee = assignedRaw === "" ? null : assignedRaw;
    patch.assigned_to = newAssignee;
  }

  const prevStage = prev?.stage ?? "";
  if (prevStage !== stage) {
    if (actorUser) {
      await supabase.from("crm_lead_stage_events").insert({
        lead_id: leadId,
        from_stage: prevStage,
        to_stage: stage,
        actor_id: actorUser.id,
      });
      await supabase.from("crm_lead_activities").insert({
        lead_id: leadId,
        author_id: actorUser.id,
        kind: "stage_change",
        body: `${prevStage} → ${stage}`,
      });
    }
    const nowIso = new Date().toISOString();
    if (stage === "won") patch.won_at = nowIso;
    if (stage === "lost") patch.lost_at = nowIso;
    if (stage === "contacted") patch.last_contact_at = nowIso;
  }

  const { error } = await supabase.from("crm_leads").update(patch).eq("id", leadId);

  if (error) throw new Error(error.message);

  const effectiveAssignee =
    actor.isAdminCrm && newAssignee !== undefined ? newAssignee : prev?.assigned_to ?? null;

  if (actorUser) {
    if (actor.isAdminCrm && newAssignee !== undefined) {
      const prevA = prev?.assigned_to ?? null;
      const nextA = newAssignee;
      if (prevA !== nextA) {
        const fromL = await profileShortLabel(supabase, prevA);
        const toL = await profileShortLabel(supabase, nextA);
        await supabase.from("crm_lead_activities").insert({
          lead_id: leadId,
          author_id: actorUser.id,
          kind: "assignment_change",
          body: `Assignation : ${fromL} → ${toL}`,
        });
      }
    }
    if (prev && prev.priority !== priority) {
      await supabase.from("crm_lead_activities").insert({
        lead_id: leadId,
        author_id: actorUser.id,
        kind: "priority_change",
        body: `Priorité : ${priorityLabelFr(prev.priority)} → ${priorityLabelFr(priority)}`,
      });
    }
    const prevF = prev?.follow_up_at ?? null;
    if (followUpKey(prevF) !== followUpKey(follow_up_at)) {
      await supabase.from("crm_lead_activities").insert({
        lead_id: leadId,
        author_id: actorUser.id,
        kind: "follow_up_change",
        body: `Prochain suivi : ${formatFollowUpFr(prevF)} → ${formatFollowUpFr(follow_up_at)}`,
      });
    }
  }

  if (actor.isAdminCrm && newAssignee && newAssignee !== prev?.assigned_to) {
    await notifyLeadAssigned(newAssignee, leadId, prev?.title ?? title, actorUser?.id ?? null).catch(() => {});
  }

  if (prevStage !== stage && effectiveAssignee && actorUser) {
    await notifyLeadStageMilestone({
      assigneeId: effectiveAssignee,
      leadId,
      title: prev?.title ?? title,
      actorId: actorUser.id,
      toStage: stage,
    }).catch(() => {});
  }

  const wasPri = prev?.priority ?? "normal";
  const isElevated = priority === "high" || priority === "urgent";
  const wasElevated = wasPri === "high" || wasPri === "urgent";
  if (isElevated && !wasElevated && effectiveAssignee && actorUser) {
    await notifyLeadPriorityHigh(effectiveAssignee, leadId, title, actorUser.id).catch(() => {});
  }

  revalidateCrmPaths();
  revalidateLeadDetail(leadId);
}

/** Quick action: set last_contact_at without changing stage */
export async function markLeadContacted(formData: FormData) {
  await requireCrmActor();
  const leadId = String(formData.get("lead_id") ?? "").trim();
  if (!leadId) throw new Error("Lead manquant");
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from("crm_leads")
    .update({ last_contact_at: nowIso })
    .eq("id", leadId);
  if (error) throw new Error(error.message);
  await supabase.from("crm_lead_activities").insert({
    lead_id: leadId,
    author_id: user.id,
    kind: "contacted",
    body: "Dernier contact enregistré",
  });
  revalidateCrmPaths();
  revalidateLeadDetail(leadId);
}

export async function deleteCrmLead(formData: FormData) {
  const actor = await requireCrmActor();
  if (!actor.isAdminCrm) throw new Error("Forbidden");
  const leadId = String(formData.get("lead_id") ?? "").trim();
  if (!leadId) throw new Error("Lead manquant");

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("crm_leads").delete().eq("id", leadId);
  if (error) throw new Error(error.message);
  revalidateCrmPaths();
}

export async function addCrmLeadNote(formData: FormData) {
  await requireCrmActor();
  const leadId = String(formData.get("lead_id") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!leadId || !body) throw new Error("Note invalide");

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("crm_lead_notes").insert({
    lead_id: leadId,
    author_id: user.id,
    body,
  });

  if (error) throw new Error(error.message);
  revalidateCrmPaths();
  revalidateLeadDetail(leadId);
}

export async function addCrmLeadActivity(formData: FormData) {
  await requireCrmActor();
  const leadId = String(formData.get("lead_id") ?? "").trim();
  const kind = String(formData.get("kind") ?? "activity").trim() || "activity";
  const body = String(formData.get("body") ?? "").trim();
  if (!leadId || !body) throw new Error("Activité invalide");

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("crm_lead_activities").insert({
    lead_id: leadId,
    author_id: user.id,
    kind,
    body,
  });

  if (error) throw new Error(error.message);
  revalidateCrmPaths();
  revalidateLeadDetail(leadId);
}

export async function quickAssignCrmLeadFromForm(formData: FormData) {
  const base = crmBasePath(String(formData.get("crm_base") ?? "/admin/leads"));
  const leadId = String(formData.get("lead_id") ?? "").trim();
  try {
    const actor = await requireCrmActor();
    if (!actor.isAdminCrm) throw new Error("Forbidden");
    const assignedRaw = String(formData.get("assigned_to") ?? "").trim();
    if (!leadId) throw new Error("Lead manquant");
    const newAssignee = assignedRaw === "" ? null : assignedRaw;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: prev } = await supabase.from("crm_leads").select("assigned_to, title").eq("id", leadId).single();
    if (!prev) throw new Error("Lead introuvable");
    if ((prev.assigned_to ?? null) !== newAssignee) {
      const { error } = await supabase.from("crm_leads").update({ assigned_to: newAssignee }).eq("id", leadId);
      if (error) throw new Error(error.message);
      const fromL = await profileShortLabel(supabase, prev.assigned_to ?? null);
      const toL = await profileShortLabel(supabase, newAssignee);
      await supabase.from("crm_lead_activities").insert({
        lead_id: leadId,
        author_id: user.id,
        kind: "assignment_change",
        body: `Assignation : ${fromL} → ${toL}`,
      });
      if (newAssignee) {
        await notifyLeadAssigned(newAssignee, leadId, prev.title ?? "", user.id).catch(() => {});
      }
    }
    revalidateCrmPaths();
    revalidateLeadDetail(leadId);
    redirect(`${base}/${leadId}?success=quick`);
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    const msg = e instanceof Error ? e.message : "Erreur";
    redirect(`${base}/${leadId}?error=${encodeURIComponent(msg)}`);
  }
}

export async function quickFollowUpCrmLeadFromForm(formData: FormData) {
  const base = crmBasePath(String(formData.get("crm_base") ?? "/admin/leads"));
  const leadId = String(formData.get("lead_id") ?? "").trim();
  try {
    await requireCrmActor();
    const followRaw = String(formData.get("follow_up_at") ?? "").trim();
    if (!leadId) throw new Error("Lead manquant");
    const follow_up_at = followRaw === "" ? null : new Date(followRaw).toISOString();
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: prev } = await supabase.from("crm_leads").select("follow_up_at").eq("id", leadId).single();
    if (!prev) throw new Error("Lead introuvable");
    const prevF = prev.follow_up_at ?? null;
    if (followUpKey(prevF) !== followUpKey(follow_up_at)) {
      const { error } = await supabase.from("crm_leads").update({ follow_up_at }).eq("id", leadId);
      if (error) throw new Error(error.message);
      await supabase.from("crm_lead_activities").insert({
        lead_id: leadId,
        author_id: user.id,
        kind: "follow_up_change",
        body: `Prochain suivi : ${formatFollowUpFr(prevF)} → ${formatFollowUpFr(follow_up_at)}`,
      });
    }
    revalidateCrmPaths();
    revalidateLeadDetail(leadId);
    redirect(`${base}/${leadId}?success=quick`);
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    const msg = e instanceof Error ? e.message : "Erreur";
    redirect(`${base}/${leadId}?error=${encodeURIComponent(msg)}`);
  }
}

export async function quickPriorityCrmLeadFromForm(formData: FormData) {
  const base = crmBasePath(String(formData.get("crm_base") ?? "/admin/leads"));
  const leadId = String(formData.get("lead_id") ?? "").trim();
  try {
    await requireCrmActor();
    const priority = String(formData.get("priority") ?? "normal").trim() || "normal";
    if (!leadId) throw new Error("Lead manquant");
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: prev } = await supabase
      .from("crm_leads")
      .select("priority, title, assigned_to")
      .eq("id", leadId)
      .single();
    if (!prev) throw new Error("Lead introuvable");
    if (prev.priority !== priority) {
      const { error } = await supabase.from("crm_leads").update({ priority }).eq("id", leadId);
      if (error) throw new Error(error.message);
      await supabase.from("crm_lead_activities").insert({
        lead_id: leadId,
        author_id: user.id,
        kind: "priority_change",
        body: `Priorité : ${priorityLabelFr(prev.priority)} → ${priorityLabelFr(priority)}`,
      });
      const assignee = prev.assigned_to ?? null;
      const wasElevated = prev.priority === "high" || prev.priority === "urgent";
      const isElevated = priority === "high" || priority === "urgent";
      if (isElevated && !wasElevated && assignee) {
        await notifyLeadPriorityHigh(assignee, leadId, prev.title ?? "", user.id).catch(() => {});
      }
    }
    revalidateCrmPaths();
    revalidateLeadDetail(leadId);
    redirect(`${base}/${leadId}?success=quick`);
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    const msg = e instanceof Error ? e.message : "Erreur";
    redirect(`${base}/${leadId}?error=${encodeURIComponent(msg)}`);
  }
}

export async function createCrmLeadFromForm(formData: FormData) {
  const base = crmBasePath(String(formData.get("crm_base") ?? "/admin/leads"));
  let newId: string | null = null;
  try {
    newId = await createCrmLead(formData);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    redirect(`${base}/new?error=${encodeURIComponent(msg)}`);
  }
  redirect(newId ? `${base}/${newId}` : base);
}

export async function updateCrmLeadFromForm(formData: FormData) {
  const base = crmBasePath(String(formData.get("crm_base") ?? "/admin/leads"));
  const leadId = String(formData.get("lead_id") ?? "").trim();
  try {
    await updateCrmLead(formData);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    redirect(`${base}/${leadId}?error=${encodeURIComponent(msg)}`);
  }
  redirect(`${base}/${leadId}?success=updated`);
}

export async function deleteCrmLeadFromForm(formData: FormData) {
  const base = crmBasePath(String(formData.get("crm_base") ?? "/admin/leads"));
  try {
    await deleteCrmLead(formData);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    redirect(`${base}?error=${encodeURIComponent(msg)}`);
  }
  redirect(`${base}?success=deleted`);
}

export async function addCrmLeadNoteFromForm(formData: FormData) {
  const base = crmBasePath(String(formData.get("crm_base") ?? "/admin/leads"));
  const leadId = String(formData.get("lead_id") ?? "").trim();
  try {
    await addCrmLeadNote(formData);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    redirect(`${base}/${leadId}?error=${encodeURIComponent(msg)}`);
  }
  redirect(`${base}/${leadId}?success=note`);
}

export async function addCrmLeadActivityFromForm(formData: FormData) {
  const base = crmBasePath(String(formData.get("crm_base") ?? "/admin/leads"));
  const leadId = String(formData.get("lead_id") ?? "").trim();
  try {
    await addCrmLeadActivity(formData);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    redirect(`${base}/${leadId}?error=${encodeURIComponent(msg)}`);
  }
  redirect(`${base}/${leadId}?success=activity`);
}

export async function markLeadContactedFromForm(formData: FormData) {
  const base = crmBasePath(String(formData.get("crm_base") ?? "/admin/leads"));
  const leadId = String(formData.get("lead_id") ?? "").trim();
  try {
    await markLeadContacted(formData);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    redirect(`${base}/${leadId}?error=${encodeURIComponent(msg)}`);
  }
  redirect(`${base}/${leadId}?success=contacted`);
}

export async function setCrmLeadStageFromForm(formData: FormData) {
  const base = crmBasePath(String(formData.get("crm_base") ?? "/admin/leads"));
  const leadId = String(formData.get("lead_id") ?? "").trim();
  const toStage = String(formData.get("to_stage") ?? "").trim();
  if (!leadId || !toStage) redirect(`${base}?error=${encodeURIComponent("Données manquantes")}`);
  try {
    await moveCrmLeadStage(leadId, toStage);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    redirect(`${base}/${leadId}?error=${encodeURIComponent(msg)}`);
  }
  redirect(`${base}/${leadId}?success=stage`);
}
