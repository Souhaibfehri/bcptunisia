import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile, getSessionUser, isFullAdmin, isHrStaff } from "@/lib/supabase/auth";
import { AdminKanbanBoard } from "@/components/admin/AdminKanbanBoard";
import { AdminFlashBanner } from "@/components/admin/AdminFlashBanner";
import { PendingSubmitButton } from "@/components/admin/PendingSubmitButton";
import { DeleteInvoicePaymentButton } from "@/components/admin/DeleteInvoicePaymentButton";
import { TeamSection } from "@/components/admin/TeamSection";
import { MilestoneSection } from "@/components/admin/MilestoneSection";
import {
  addProjectUpdate,
  createInvoice,
  updateInvoiceStatus,
  addInvoicePayment,
  deleteInvoice,
  uploadProjectDocument,
  updateProjectStatus,
  deleteProjectDocument,
  archiveProject,
} from "@/app/admin/actions";
import {
  projectStatusStyle,
  projectStatusLabel,
  invoiceStyle,
  invoiceLabel,
  isOverdue,
  computeProjectHealth,
  healthDotColor,
  healthLabel,
} from "@/lib/status";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { buttonClass } from "@/components/ui/button-variants";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AdminProjectPipelinePage({ params, searchParams }: PageProps) {
  const { projectId } = await params;
  const sp = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: project, error: projectErr } = await supabase
    .from("projects")
    .select("id, name, status, summary, objective, client_id, starts_on, ends_on")
    .eq("id", projectId)
    .single();

  if (projectErr || !project) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[admin/project]", projectErr?.message);
    }
    notFound();
  }

  const profile = await getProfile();
  const user = await getSessionUser();
  const fullAdmin = profile ? isFullAdmin(profile.role) : false;
  if (profile && !isFullAdmin(profile.role) && !isHrStaff(profile.role) && user) {
    const { data: membership } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();
    if (!membership) notFound();
  }

  const { data: clientRow } = project.client_id
    ? await supabase.from("clients").select("id, name").eq("id", project.client_id).single()
    : { data: null };

  const { data: membersRaw } = await supabase
    .from("project_members")
    .select("user_id, role, profiles ( display_name, email, role )")
    .eq("project_id", projectId);

  const members = (membersRaw ?? []).map((m) => ({
    user_id: m.user_id,
    role: m.role,
    profile: (() => {
      const p = m.profiles as { display_name: string | null; email: string | null; role: string } | { display_name: string | null; email: string | null; role: string }[] | null;
      if (!p) return null;
      return Array.isArray(p) ? p[0] ?? null : p;
    })(),
  }));

  const { data: permRows } = await supabase
    .from("project_member_permissions")
    .select("user_id, permissions")
    .eq("project_id", projectId);
  const permissionByUser: Record<string, { view_invoices?: boolean; view_budget?: boolean }> = {};
  for (const r of permRows ?? []) {
    const p = r.permissions as { view_invoices?: boolean; view_budget?: boolean } | null;
    if (p) permissionByUser[r.user_id] = p;
  }

  const viewerHr = profile && isHrStaff(profile.role);
  const internalMemberIds = members
    .filter((m) => m.role === "project_manager" || m.role === "team_member")
    .map((m) => m.user_id);
  let hrEmployeeUserIds: string[] = [];
  if (viewerHr && internalMemberIds.length > 0) {
    const { data: hrRows } = await supabase.from("hr_employees").select("user_id").in("user_id", internalMemberIds);
    hrEmployeeUserIds = (hrRows ?? []).map((r) => r.user_id);
  }

  const { data: stages } = await supabase
    .from("project_stages")
    .select(`
      id, title, status, due_on, completed_at, progress_percent, sort_order,
      project_tasks (
        id, title, status, due_on, completed_at, progress_percent, sort_order, assigned_to,
        project_subtasks ( id, title, status, sort_order )
      )
    `)
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  const allTasks = (stages ?? []).flatMap((s) =>
    ((s.project_tasks ?? []) as { due_on: string | null; status: string }[]),
  );
  const health = computeProjectHealth(allTasks);

  const stageList = stages ?? [];
  const totalTasks = allTasks.length;
  // Header progress uses completed task ratio to match pipeline doneCount/taskCount (not progress_percent).
  let rawAvgProgress = 0;
  if (totalTasks > 0) {
    const completedTasks = allTasks.filter((t) => t.status === "completed").length;
    rawAvgProgress = (completedTasks / totalTasks) * 100;
  } else if (stageList.length > 0) {
    rawAvgProgress =
      stageList.reduce((s, st) => s + (st.progress_percent ?? 0), 0) / stageList.length;
  }
  const avgProgress = Math.round(Math.min(100, Math.max(0, rawAvgProgress)));

  const { data: milestones } = await supabase
    .from("project_milestones")
    .select("id, title, target_on, achieved_at, sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  const { data: recentUpdates } = await supabase
    .from("project_updates")
    .select("id, title, visible_to_client, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(6);

  const { data: recentInvoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, amount_cents, amount_paid_cents, currency, status, due_on, paid_at, notes")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(20);

  const invoiceIds = (recentInvoices ?? []).map((i) => i.id);
  const { data: allPayments } = invoiceIds.length > 0
    ? await supabase
        .from("invoice_payments")
        .select("id, invoice_id, amount_cents, paid_on, method, reference, notes")
        .in("invoice_id", invoiceIds)
        .order("paid_on", { ascending: false })
    : { data: [] as { id: string; invoice_id: string; amount_cents: number; paid_on: string; method: string | null; reference: string | null; notes: string | null }[] };

  const paymentsByInvoice = new Map<string, typeof allPayments>();
  for (const p of allPayments ?? []) {
    const arr = paymentsByInvoice.get(p.invoice_id) ?? [];
    arr.push(p);
    paymentsByInvoice.set(p.invoice_id, arr);
  }

  const { data: recentDocs } = await supabase
    .from("project_documents")
    .select("id, filename, storage_path, visible_to_client, created_at, category")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(8);

  const docsWithUrls = await Promise.all(
    (recentDocs ?? []).map(async (d) => {
      const { data: signed } = await supabase.storage
        .from("project-documents")
        .createSignedUrl(d.storage_path, 3600);
      return { ...d, signedUrl: signed?.signedUrl ?? null };
    }),
  );

  const memberNameMap = new Map<string, string>();
  for (const m of members) {
    if (m.profile) memberNameMap.set(m.user_id, m.profile.display_name || m.profile.email || m.user_id);
  }

  const kanbanStages = (stages ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    status: (s as Record<string, unknown>).status as string | undefined,
    sort_order: s.sort_order,
    project_tasks: ((s.project_tasks as { id: string; title: string; sort_order: number; status?: string; due_on?: string | null; assigned_to?: string | null; project_subtasks?: { id: string; title: string; status: string; sort_order: number }[] | null }[] | null) ?? []).map((t) => ({
      ...t,
      assignee_name: t.assigned_to ? (memberNameMap.get(t.assigned_to) ?? null) : null,
      subtasks: ((t.project_subtasks ?? []) as { id: string; title: string; status: string; sort_order: number }[]).sort((a, b) => a.sort_order - b.sort_order),
    })),
  }));

  const kanbanBoardKey = `${projectId}/${kanbanStages
    .map((s) => `${s.id}:${s.sort_order}:${(s.project_tasks ?? []).map((t) => `${t.id}:${t.sort_order}`).join(",")}`)
    .join("|")}`;

  return (
    <div className="space-y-8">
      <AdminFlashBanner error={sp.error} success={sp.success} />

      {/* Header — project overview */}
      <Card elevated accent className="ring-1 ring-bcp-anthracite/[0.04]" padding="lg">
        <Link href="/admin/projects" className="text-xs font-medium text-bcp-gold transition hover:text-bcp-copper">
          ← Tous les projets
        </Link>

        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-bcp-anthracite md:text-[1.65rem]">{project.name}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-bcp-border bg-bcp-surface/40 px-2.5 py-1 text-xs text-bcp-anthracite">
                  <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-bcp-muted">Client</span>
                  <span className="font-medium">{clientRow?.name ?? "—"}</span>
                </span>
                {project.starts_on && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-bcp-border bg-bcp-surface/40 px-2.5 py-1 text-xs text-bcp-anthracite">
                    <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-bcp-muted">Début</span>
                    <span className="font-medium">{project.starts_on}</span>
                  </span>
                )}
                {project.ends_on && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-bcp-border bg-bcp-surface/40 px-2.5 py-1 text-xs text-bcp-anthracite">
                    <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-bcp-muted">Fin</span>
                    <span className="font-medium">{project.ends_on}</span>
                  </span>
                )}
              </div>
            </div>
            {project.summary && (
              <div className="rounded-xl border border-bcp-border/80 bg-bcp-cream/25 px-4 py-3">
                <p className="text-sm leading-relaxed text-bcp-anthracite">{project.summary}</p>
              </div>
            )}
            {project.objective && (
              <p className="border-l-2 border-bcp-gold/60 pl-3 text-sm italic leading-relaxed text-bcp-muted">{project.objective}</p>
            )}
          </div>

          <div className="flex w-full shrink-0 flex-col justify-between gap-5 rounded-xl border border-bcp-border bg-gradient-to-b from-bcp-cream/50 to-white p-5 lg:max-w-sm lg:border-l lg:border-t-0 lg:border-bcp-border">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-bcp-border bg-white/80 px-3 py-1.5 shadow-sm">
                  <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${healthDotColor(health)}`} />
                  <span className="text-xs font-medium text-bcp-anthracite">{healthLabel(health)}</span>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${projectStatusStyle(project.status)}`}>
                  {projectStatusLabel(project.status)}
                </span>
              </div>
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-bcp-muted">Avancement moyen</span>
                  <span className="text-sm font-bold tabular-nums text-bcp-anthracite">{avgProgress}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-bcp-surface ring-1 ring-inset ring-bcp-border/40">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-bcp-gold to-bcp-copper transition-[width]"
                    style={{ width: `${avgProgress}%` }}
                  />
                </div>
              </div>
            </div>
            <form action={updateProjectStatus} className="flex flex-col gap-2 border-t border-bcp-border/60 pt-4 sm:flex-row sm:items-center sm:justify-end">
              <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                <input type="hidden" name="project_id" value={projectId} />
                <select
                  name="status"
                  defaultValue={project.status}
                  className="bcp-input min-w-[8.5rem] flex-1 text-xs font-medium sm:flex-none"
                >
                  <option value="draft">Brouillon</option>
                  <option value="active">Actif</option>
                  <option value="on_hold">En pause</option>
                  <option value="completed">Terminé</option>
                  <option value="archived">Archivé</option>
                </select>
                <PendingSubmitButton pendingLabel="…" className={buttonClass({ size: "sm" })}>
                  OK
                </PendingSubmitButton>
              </div>
            </form>
            {fullAdmin ? (
              <details className="mt-4 rounded-lg border border-red-200 bg-red-50/40 p-3 text-xs">
                <summary className="cursor-pointer font-semibold text-red-900">Archiver le projet</summary>
                <p className="mt-2 text-bcp-muted">Le projet passera en statut archivé (soft delete). Saisissez le nom exact pour confirmer.</p>
                <form action={archiveProject} className="mt-2 space-y-2">
                  <input type="hidden" name="project_id" value={projectId} />
                  <input type="hidden" name="redirect_to" value={`/admin/projects/${projectId}`} />
                  <input
                    name="confirm_name"
                    required
                    placeholder={project.name}
                    className="bcp-input w-full text-sm"
                  />
                  <PendingSubmitButton pendingLabel="…" className={buttonClass({ variant: "danger", size: "sm" })}>
                    Archiver définitivement (statut)
                  </PendingSubmitButton>
                </form>
              </details>
            ) : null}
          </div>
        </div>
      </Card>

      {/* Team */}
      <TeamSection
        projectId={projectId}
        members={members}
        showHrDeepLinks={!!viewerHr}
        hrEmployeeUserIds={hrEmployeeUserIds}
        permissionByUser={permissionByUser}
        canEditPermissions={fullAdmin}
      />

      {/* Milestones */}
      <MilestoneSection projectId={projectId} milestones={milestones ?? []} />

      {/* Kanban */}
      <Card className="bg-gradient-to-b from-bcp-cream/35 to-bcp-cream/55" padding="md">
        <SectionHeader title="Pipeline — étapes & tâches" className="mb-4" />
        <AdminKanbanBoard
          key={kanbanBoardKey}
          projectId={projectId}
          stages={kanbanStages}
          members={members.map((m) => ({
            user_id: m.user_id,
            name: m.profile?.display_name || m.profile?.email || m.user_id,
          }))}
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Updates */}
        <Card padding="md">
          <SectionHeader title="Actualités" />
          <form action={addProjectUpdate} className="mt-4 space-y-3">
            <input type="hidden" name="project_id" value={projectId} />
            <div>
              <label className="text-xs text-bcp-muted">Titre *</label>
              <input name="title" required placeholder="Ex. Livraison phase 1" className="mt-1 bcp-input" />
            </div>
            <div>
              <label className="text-xs text-bcp-muted">Contenu</label>
              <textarea name="body" placeholder="Description détaillée (optionnel)" rows={3} className="mt-1 bcp-input min-h-[5rem]" />
            </div>
            <label className="flex items-center gap-2 text-xs text-bcp-muted">
              <input type="checkbox" name="visible_to_client" defaultChecked className="rounded" /> Visible aux clients
            </label>
            <PendingSubmitButton pendingLabel="…" className={buttonClass({ size: "sm" })}>
              Publier
            </PendingSubmitButton>
          </form>
          {(recentUpdates ?? []).length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-bcp-border bg-bcp-surface/30 px-4 py-6 text-center">
              <p className="text-sm text-bcp-muted">Aucune actualité publiée.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-2 border-t border-bcp-border pt-4 text-xs text-bcp-muted">
              {(recentUpdates ?? []).map((u) => (
                <li key={u.id} className="flex justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-bcp-surface/40">
                  <span className="font-medium text-bcp-anthracite">{u.title}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[0.6rem] ${u.visible_to_client ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    {u.visible_to_client ? "client" : "interne"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Invoices */}
        <Card padding="md">
          <SectionHeader title="Factures" />

          {/* New invoice form */}
          <details className="group mt-4">
            <summary className="cursor-pointer rounded-lg bg-bcp-surface/40 px-4 py-2.5 text-xs font-semibold text-bcp-navy transition hover:bg-bcp-surface/70">
              + Nouvelle facture
            </summary>
            <form action={createInvoice} className="mt-3 space-y-3 rounded-xl border border-bcp-border bg-bcp-surface/20 p-4">
              <input type="hidden" name="project_id" value={projectId} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-bcp-muted">N° facture *</label>
                  <input name="invoice_number" required placeholder="FAC-001" className="mt-1 bcp-input" />
                </div>
                <div>
                  <label className="text-xs text-bcp-muted">Montant TND *</label>
                  <input name="amount_tnd" required placeholder="1500.50" className="mt-1 bcp-input" />
                </div>
                <div>
                  <label className="text-xs text-bcp-muted">Échéance</label>
                  <input name="due_on" type="date" className="mt-1 bcp-input" />
                </div>
                <div>
                  <label className="text-xs text-bcp-muted">Statut initial</label>
                  <select name="status" defaultValue="sent" className="mt-1 bcp-input">
                    <option value="draft">Brouillon</option>
                    <option value="sent">Envoyée</option>
                    <option value="pending_validation">En validation</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-bcp-muted">Notes internes</label>
                <input name="notes" placeholder="Optionnel" className="mt-1 bcp-input" />
              </div>
              <PendingSubmitButton
                pendingLabel="…"
                className="min-h-10 rounded-full bg-gradient-gold px-4 py-2 text-xs font-semibold text-bcp-anthracite shadow-sm transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bcp-gold focus-visible:ring-offset-2"
              >
                Créer la facture
              </PendingSubmitButton>
            </form>
          </details>

          {/* Invoice list */}
          {(recentInvoices ?? []).length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-bcp-border bg-bcp-surface/30 px-4 py-6 text-center">
              <p className="text-sm text-bcp-muted">Aucune facture.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {(recentInvoices ?? []).map((inv) => {
                const paid = inv.amount_paid_cents ?? 0;
                const remaining = Math.max(0, inv.amount_cents - paid);
                const paidPct = inv.amount_cents > 0 ? Math.min(100, Math.round((paid / inv.amount_cents) * 100)) : 0;
                const payments = paymentsByInvoice.get(inv.id) ?? [];

                return (
                  <div key={inv.id} className="rounded-xl border border-bcp-border bg-white shadow-sm">
                    {/* Invoice header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bcp-border px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-bcp-anthracite">{inv.invoice_number}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${invoiceStyle(inv.status)}`}>
                          {invoiceLabel(inv.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-bcp-muted">
                        {inv.due_on && (
                          <span className={isOverdue(inv.due_on, inv.status) ? "font-semibold text-red-600" : ""}>
                            Éch. {inv.due_on}
                          </span>
                        )}
                        {inv.paid_at && (
                          <span className="text-emerald-600">Payée le {new Date(inv.paid_at).toLocaleDateString("fr-FR")}</span>
                        )}
                      </div>
                    </div>

                    {/* Financial summary */}
                    <div className="grid grid-cols-1 gap-px bg-bcp-border text-center text-xs sm:grid-cols-3">
                      <div className="bg-white px-3 py-2.5">
                        <span className="block text-bcp-muted">Total</span>
                        <span className="text-sm font-bold text-bcp-anthracite">{(inv.amount_cents / 100).toFixed(2)} {inv.currency}</span>
                      </div>
                      <div className="bg-white px-3 py-2.5">
                        <span className="block text-bcp-muted">Payé</span>
                        <span className="text-sm font-bold text-emerald-600">{(paid / 100).toFixed(2)} {inv.currency}</span>
                      </div>
                      <div className="bg-white px-3 py-2.5">
                        <span className="block text-bcp-muted">Restant</span>
                        <span className={`text-sm font-bold ${remaining > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                          {(remaining / 100).toFixed(2)} {inv.currency}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {inv.amount_cents > 0 && (
                      <div className="px-4 py-2">
                        <div className="h-2 overflow-hidden rounded-full bg-bcp-surface">
                          <div
                            className={`h-full rounded-full transition-[width] ${paidPct >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-bcp-gold to-bcp-copper"}`}
                            style={{ width: `${paidPct}%` }}
                          />
                        </div>
                        <p className="mt-0.5 text-right text-[0.65rem] text-bcp-muted">{paidPct}%</p>
                      </div>
                    )}

                    {/* Payment history */}
                    <div className="border-t border-bcp-border px-4 py-3">
                      <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-bcp-muted">Historique des paiements</p>
                      {payments.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-bcp-border bg-bcp-surface/30 px-3 py-2 text-xs text-bcp-muted">
                          Aucun paiement enregistré — utilisez « Enregistrer un paiement » ci-dessous.
                        </p>
                      ) : (
                        <div className="bcp-table-wrap">
                          <table className="bcp-table text-xs">
                            <thead className="text-[0.6rem] uppercase">
                              <tr>
                                <th className="px-3 py-2 font-semibold">Montant</th>
                                <th className="px-3 py-2 font-semibold">Date</th>
                                <th className="px-3 py-2 font-semibold">Méthode</th>
                                <th className="px-3 py-2 font-semibold">Réf.</th>
                                <th className="px-3 py-2 font-semibold">Notes</th>
                                <th className="px-3 py-2 text-right font-semibold">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {payments.map((pay) => (
                                <tr key={pay.id}>
                                  <td className="px-3 py-2 font-semibold text-emerald-700">{(pay.amount_cents / 100).toFixed(2)} TND</td>
                                  <td className="px-3 py-2 text-bcp-muted">{new Date(pay.paid_on).toLocaleDateString("fr-FR")}</td>
                                  <td className="px-3 py-2 text-bcp-muted">{pay.method ?? "—"}</td>
                                  <td className="px-3 py-2 text-bcp-muted">{pay.reference ?? "—"}</td>
                                  <td className="max-w-[140px] truncate px-3 py-2 italic text-bcp-muted" title={pay.notes ?? undefined}>{pay.notes ?? "—"}</td>
                                  <td className="px-3 py-2 text-right">
                                    <DeleteInvoicePaymentButton projectId={projectId} invoiceId={inv.id} paymentId={pay.id} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Actions row */}
                    <div className="flex flex-wrap items-center gap-2 border-t border-bcp-border px-4 py-3">
                      {/* Add payment */}
                      {inv.status !== "paid" && inv.status !== "cancelled" && (
                        <details className="group/pay">
                          <summary className="cursor-pointer rounded-full bg-emerald-600 px-3 py-1 text-[0.65rem] font-semibold text-white transition hover:bg-emerald-700">
                            + Enregistrer un paiement
                          </summary>
                          <form action={addInvoicePayment} className="mt-2 flex flex-wrap items-end gap-2 rounded-lg border border-bcp-border bg-bcp-surface/30 p-3">
                            <input type="hidden" name="project_id" value={projectId} />
                            <input type="hidden" name="invoice_id" value={inv.id} />
                            <div>
                              <label className="text-[0.6rem] text-bcp-muted">Montant TND *</label>
                              <input name="amount_tnd" required placeholder="500.00" className="mt-0.5 w-24 bcp-input py-1 text-xs" />
                            </div>
                            <div>
                              <label className="text-[0.6rem] text-bcp-muted">Date</label>
                              <input name="paid_on" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="mt-0.5 w-28 bcp-input py-1 text-xs" />
                            </div>
                            <div>
                              <label className="text-[0.6rem] text-bcp-muted">Méthode</label>
                              <select name="method" className="mt-0.5 bcp-input py-1 text-xs">
                                <option value="">—</option>
                                <option value="Virement">Virement</option>
                                <option value="Chèque">Chèque</option>
                                <option value="Espèces">Espèces</option>
                                <option value="Carte">Carte</option>
                                <option value="Autre">Autre</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[0.6rem] text-bcp-muted">Référence</label>
                              <input name="reference" placeholder="N° chèque, réf." className="mt-0.5 w-28 bcp-input py-1 text-xs" />
                            </div>
                            <div>
                              <label className="text-[0.6rem] text-bcp-muted">Notes</label>
                              <input name="notes" placeholder="Optionnel" className="mt-0.5 w-24 bcp-input py-1 text-xs" />
                            </div>
                            <PendingSubmitButton
                              pendingLabel="…"
                              className="min-h-9 rounded-full bg-emerald-600 px-3 py-2 text-[0.65rem] font-semibold text-white sm:py-1"
                            >
                              Valider
                            </PendingSubmitButton>
                          </form>
                        </details>
                      )}

                      {/* Status change */}
                      <form action={updateInvoiceStatus} className="flex items-center gap-1">
                        <input type="hidden" name="project_id" value={projectId} />
                        <input type="hidden" name="invoice_id" value={inv.id} />
                        <select name="status" defaultValue={inv.status} className="bcp-input px-1.5 py-1 text-[0.65rem]">
                          <option value="draft">Brouillon</option>
                          <option value="sent">Envoyée</option>
                          <option value="pending_validation">En validation</option>
                          <option value="partially_paid">Part. payée</option>
                          <option value="paid">Payée</option>
                          <option value="overdue">En retard</option>
                          <option value="cancelled">Annulée</option>
                        </select>
                        <PendingSubmitButton
                          pendingLabel="…"
                          className={buttonClass({ size: "sm", className: "min-h-9 px-2.5 py-2 text-[0.65rem] font-medium sm:py-1" })}
                        >
                          Statut
                        </PendingSubmitButton>
                      </form>

                      {/* Delete invoice */}
                      <form action={deleteInvoice}>
                        <input type="hidden" name="project_id" value={projectId} />
                        <input type="hidden" name="invoice_id" value={inv.id} />
                        <PendingSubmitButton
                          pendingLabel="…"
                          className="min-h-9 rounded-full border border-red-200 px-2.5 py-2 text-[0.65rem] text-red-500 transition hover:bg-red-50 hover:text-red-700 sm:py-1"
                        >
                          Supprimer
                        </PendingSubmitButton>
                      </form>
                    </div>

                    {/* Notes */}
                    {inv.notes && (
                      <div className="border-t border-bcp-border px-4 py-2">
                        <p className="text-[0.65rem] italic text-bcp-muted">Note : {inv.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Documents */}
      <Card padding="md">
        <SectionHeader title="Documents" />
        <form action={uploadProjectDocument} encType="multipart/form-data" className="mt-4 space-y-3">
          <input type="hidden" name="project_id" value={projectId} />
          <div className="rounded-xl border-2 border-dashed border-bcp-border bg-bcp-surface/30 p-4 text-center transition hover:border-bcp-gold/50">
            <label className="cursor-pointer text-sm text-bcp-muted">
              Glissez un fichier ici ou <span className="font-medium text-bcp-navy underline">parcourir</span>
              <input name="file" type="file" required className="sr-only" />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-bcp-muted">Catégorie</label>
              <select name="category" className="mt-1 bcp-input">
                <option value="">— Aucune —</option>
                <option value="Contrat">Contrat</option>
                <option value="Livrable">Livrable</option>
                <option value="Facture">Facture</option>
                <option value="Technique">Technique</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-xs text-bcp-muted">
                <input type="checkbox" name="visible_to_client" defaultChecked className="rounded" /> Visible aux clients
              </label>
            </div>
          </div>
          <PendingSubmitButton pendingLabel="…" className={buttonClass({ size: "sm" })}>
            Téléverser
          </PendingSubmitButton>
        </form>
        {docsWithUrls.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-bcp-border bg-bcp-surface/30 px-4 py-6 text-center">
            <p className="text-sm text-bcp-muted">Aucun document téléversé.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2 border-t border-bcp-border pt-4 text-xs">
            {docsWithUrls.map((d) => {
              const ext = d.filename?.split(".").pop()?.toLowerCase() ?? "";
              const typeIcon: Record<string, string> = { pdf: "text-red-500", doc: "text-blue-500", docx: "text-blue-500", xls: "text-emerald-600", xlsx: "text-emerald-600", png: "text-violet-500", jpg: "text-violet-500", jpeg: "text-violet-500" };
              return (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-bcp-surface/40 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[0.65rem] font-bold uppercase ${typeIcon[ext] ?? "text-bcp-muted"}`}>{ext || "?"}</span>
                    {d.signedUrl ? (
                      <a href={d.signedUrl} target="_blank" rel="noreferrer" className="font-medium text-bcp-navy underline hover:text-bcp-gold">{d.filename}</a>
                    ) : (
                      <span className="text-bcp-anthracite">{d.filename}</span>
                    )}
                    {d.category && <span className="rounded-full bg-bcp-surface px-1.5 py-0.5 text-[0.6rem] text-bcp-muted">{d.category}</span>}
                    {!d.visible_to_client && <span className="text-[0.6rem] text-amber-600">(interne)</span>}
                  </div>
                  <form action={deleteProjectDocument}>
                    <input type="hidden" name="project_id" value={projectId} />
                    <input type="hidden" name="doc_id" value={d.id} />
                    <input type="hidden" name="storage_path" value={d.storage_path} />
                    <PendingSubmitButton pendingLabel="…" className="min-h-9 text-xs text-red-500 hover:text-red-700 sm:min-h-0">
                      Supprimer
                    </PendingSubmitButton>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

    </div>
  );
}
