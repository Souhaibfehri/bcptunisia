import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PortalProjectColumns } from "@/components/portal/PortalProjectColumns";
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
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ projectId: string }> };

export default async function PortalProjectDetailPage({ params }: PageProps) {
  const { projectId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: project, error: pErr } = await supabase
    .from("projects")
    .select("id, name, status, summary, objective, starts_on, ends_on")
    .eq("id", projectId)
    .single();

  if (pErr || !project) {
    if (pErr && process.env.NODE_ENV === "development") {
      console.warn("[portal/project]", pErr.message);
    }
    notFound();
  }

  const archived = project.status === "archived";

  const { data: stages } = await supabase
    .from("project_stages")
    .select(`
      id, title, status, due_on, completed_at, progress_percent, sort_order,
      project_tasks (
        id, title, status, due_on, completed_at, progress_percent, sort_order,
        project_subtasks (
          id, title, status, due_on, completed_at, sort_order
        )
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
    .select("id, title, description, target_on, achieved_at, sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  const { data: updates } = await supabase
    .from("project_updates")
    .select("id, title, body, created_at")
    .eq("project_id", projectId)
    .eq("visible_to_client", true)
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: docs } = await supabase
    .from("project_documents")
    .select("id, filename, category, created_at, storage_path")
    .eq("project_id", projectId)
    .eq("visible_to_client", true)
    .order("created_at", { ascending: false });

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, amount_cents, amount_paid_cents, currency, status, due_on, paid_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  const invoiceIds = (invoices ?? []).map((i) => i.id);
  const { data: allPayments } = invoiceIds.length > 0
    ? await supabase
        .from("invoice_payments")
        .select("id, invoice_id, amount_cents, paid_on, method, reference, notes")
        .in("invoice_id", invoiceIds)
        .order("paid_on", { ascending: false })
    : { data: [] as { id: string; invoice_id: string; amount_cents: number; paid_on: string; method: string | null; reference: string | null; notes: string | null }[] };

  type _PayRow = { id: string; invoice_id: string; amount_cents: number; paid_on: string; method: string | null; reference: string | null; notes: string | null };
  const paymentsByInvoice = new Map<string, _PayRow[]>();
  for (const p of (allPayments ?? []) as _PayRow[]) {
    const arr = paymentsByInvoice.get(p.invoice_id) ?? [];
    arr.push(p);
    paymentsByInvoice.set(p.invoice_id, arr);
  }

  const docsWithUrls = await Promise.all(
    (docs ?? []).map(async (d) => {
      const { data: signed } = await supabase.storage
        .from("project-documents")
        .createSignedUrl(d.storage_path, 3600);
      return { ...d, signedUrl: signed?.signedUrl ?? null };
    }),
  );

  const columnStages = (stages ?? []) as unknown as Parameters<typeof PortalProjectColumns>[0]["stages"];

  const now = new Date();

  function relativeTime(iso: string): string {
    const diff = now.getTime() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "à l'instant";
    if (mins < 60) return `il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days}j`;
  }

  const paidInvoices = (invoices ?? []).filter((i) => i.status === "paid");
  const pendingInvoices = (invoices ?? []).filter((i) => ["sent", "partially_paid", "pending_validation"].includes(i.status));
  const overdueInvoices = (invoices ?? []).filter((i) => i.status === "overdue" || (i.due_on && new Date(i.due_on) < now && !["paid", "cancelled"].includes(i.status)));
  const otherInvoices = (invoices ?? []).filter((i) => ["draft", "cancelled"].includes(i.status));

  const totalDue = (invoices ?? []).reduce((acc, i) => acc + (["paid", "cancelled"].includes(i.status) ? 0 : i.amount_cents - (i.amount_paid_cents ?? 0)), 0);
  const totalPaid = (invoices ?? []).reduce((acc, i) => acc + (i.amount_paid_cents ?? 0), 0);

  return (
    <div className="space-y-10">
      {archived ? (
        <div className="rounded-xl border border-amber-200/90 bg-[var(--status-warning-bg)] px-4 py-3 text-sm text-[var(--status-warning-fg)]">
          Ce projet est <strong>archivé</strong>. Les informations restent visibles en lecture seule.
        </div>
      ) : null}
      {/* Header */}
      <Card elevated accent padding="md">
        <Link href="/portal/dashboard" className="text-xs font-medium text-bcp-gold transition hover:text-bcp-copper">← Mes projets</Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <h1 className="bcp-page-title text-bcp-anthracite">{project.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${healthDotColor(health)}`} />
            <Badge size="md" className="border border-bcp-border bg-bcp-surface/80 text-bcp-muted normal-case tracking-normal">
              {healthLabel(health)}
            </Badge>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${projectStatusStyle(project.status)}`}>
              {projectStatusLabel(project.status)}
            </span>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-bcp-muted">
          {project.starts_on && <span>Début : {project.starts_on}</span>}
          {project.ends_on && <span>Fin prévue : {project.ends_on}</span>}
        </div>
        {project.objective && (
          <p className="mt-3 rounded-xl border border-bcp-gold/25 bg-bcp-cream/50 px-4 py-3 text-sm text-bcp-anthracite">
            <span className="text-xs font-semibold uppercase tracking-wider text-bcp-gold">Objectif</span>
            <br />
            {project.objective}
          </p>
        )}
        {project.summary && !project.objective && <p className="mt-3 text-sm text-bcp-muted">{project.summary}</p>}
        <div className="mt-4">
          <div className="h-2.5 overflow-hidden rounded-full bg-bcp-surface ring-1 ring-inset ring-bcp-border/40">
            <div className="h-full rounded-full bg-gradient-to-r from-bcp-gold to-bcp-copper transition-[width]" style={{ width: `${avgProgress}%` }} />
          </div>
          <p className="mt-1 text-xs text-bcp-muted">Avancement moyen : {avgProgress}%</p>
        </div>
      </Card>

      {/* Column view */}
      <PortalProjectColumns stages={columnStages} />

      {/* Milestones */}
      <section>
        <SectionHeader title="Jalons" className="mb-3" />
        {(milestones ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-bcp-border bg-bcp-cream/25 px-4 py-8 text-center">
            <p className="text-sm font-medium text-bcp-anthracite">Aucun jalon défini pour ce projet.</p>
            <p className="mt-1 text-xs text-bcp-muted">Votre équipe BCP pourra ajouter des jalons ici.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(milestones ?? []).map((m) => {
              const overdue = !m.achieved_at && m.target_on && isOverdue(m.target_on, "pending");
              return (
                <div
                  key={m.id}
                  className={`rounded-xl border bg-white p-4 ${
                    m.achieved_at ? "border-emerald-200" : overdue ? "border-red-200" : "border-bcp-border"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {m.achieved_at ? (
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      ) : overdue ? (
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                      ) : (
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-400" />
                      )}
                      <span className={`text-sm font-medium ${m.achieved_at ? "text-emerald-700" : "text-bcp-anthracite"}`}>
                        {m.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-bcp-muted">
                      {m.target_on && <span>Cible : {m.target_on}</span>}
                      {m.achieved_at && <span className="font-medium text-emerald-600">Atteint</span>}
                      {overdue && <span className="font-semibold text-red-600">En retard</span>}
                    </div>
                  </div>
                  {m.description && <p className="mt-2 text-sm text-bcp-muted">{m.description}</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Updates timeline */}
        <section>
          <SectionHeader title="Dernières actualités" className="mb-3" />
          {(updates ?? []).length === 0 ? (
            <div className="rounded-xl border border-dashed border-bcp-border bg-bcp-cream/25 px-4 py-8 text-center">
              <p className="text-sm font-medium text-bcp-anthracite">Aucune mise à jour publiée.</p>
              <p className="mt-1 text-xs text-bcp-muted">Les nouvelles étapes apparaîtront ici.</p>
            </div>
          ) : (
            <div className="relative space-y-4 border-l-2 border-bcp-gold/35 pl-6">
              {(updates ?? []).map((u) => (
                <div key={u.id} className="relative">
                  <span className="absolute -left-[31px] top-1 inline-block h-3 w-3 rounded-full border-2 border-bcp-gold/50 bg-white shadow-sm" />
                  <div className="bcp-card rounded-xl border border-bcp-border bg-white p-4 shadow-sm">
                    <p className="font-medium text-bcp-anthracite">{u.title}</p>
                    <p className="mt-0.5 text-xs text-bcp-muted">{relativeTime(u.created_at)} · {new Date(u.created_at).toLocaleDateString("fr-FR")}</p>
                    {u.body && <p className="mt-2 text-sm text-bcp-muted">{u.body}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-8">
          {/* Documents */}
          <section>
            <SectionHeader title="Documents" className="mb-3" />
            {docsWithUrls.length === 0 ? (
              <div className="rounded-xl border border-dashed border-bcp-border bg-bcp-cream/25 px-4 py-8 text-center">
                <p className="text-sm font-medium text-bcp-anthracite">Aucun document partagé.</p>
                <p className="mt-1 text-xs text-bcp-muted">Les livrables apparaîtront ici lorsqu’ils seront publiés.</p>
              </div>
            ) : (
              <div className="divide-y divide-bcp-border overflow-hidden rounded-xl border border-bcp-border bg-white shadow-sm">
                {docsWithUrls.map((d) => {
                  const ext = d.filename?.split(".").pop()?.toLowerCase() ?? "";
                  const typeIcon: Record<string, string> = { pdf: "text-red-500", doc: "text-blue-500", docx: "text-blue-500", xls: "text-emerald-600", xlsx: "text-emerald-600", png: "text-violet-500", jpg: "text-violet-500" };
                  return (
                    <div key={d.id} className="flex items-center justify-between gap-2 px-4 py-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`text-[0.65rem] font-bold uppercase ${typeIcon[ext] ?? "text-bcp-muted"}`}>{ext || "?"}</span>
                        {d.signedUrl ? (
                          <a href={d.signedUrl} target="_blank" rel="noreferrer" className="font-medium text-bcp-navy underline hover:text-bcp-gold">{d.filename}</a>
                        ) : (
                          <span className="text-bcp-anthracite">{d.filename}</span>
                        )}
                        {d.category && <span className="rounded-full bg-bcp-surface px-1.5 py-0.5 text-[0.6rem] text-bcp-muted">{d.category}</span>}
                      </div>
                      <span className="text-xs text-bcp-muted">{new Date(d.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Invoices grouped */}
          <section>
            <SectionHeader title="Factures" className="mb-3" />

            {(invoices ?? []).length === 0 ? (
              <div className="rounded-xl border border-dashed border-bcp-border bg-bcp-cream/25 px-4 py-8 text-center">
                <p className="text-sm font-medium text-bcp-anthracite">Aucune facture.</p>
                <p className="mt-1 text-xs text-bcp-muted">Le détail des factures s’affichera ici.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary */}
                <div className="flex items-center justify-between rounded-xl bg-bcp-surface/60 px-4 py-3 text-sm">
                  <span className="text-bcp-muted">Total dû</span>
                  <span className="font-semibold text-bcp-anthracite">{(totalDue / 100).toFixed(2)} TND</span>
                </div>
                {totalPaid > 0 && (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50/60 px-4 py-3 text-sm">
                    <span className="text-emerald-700">Total payé</span>
                    <span className="font-semibold text-emerald-700">{(totalPaid / 100).toFixed(2)} TND</span>
                  </div>
                )}

                {overdueInvoices.length > 0 && (
                  <InvoiceGroup label="En retard" invoices={overdueInvoices} accent="red" paymentsByInvoice={paymentsByInvoice} />
                )}
                {pendingInvoices.length > 0 && (
                  <InvoiceGroup label="À payer" invoices={pendingInvoices} accent="amber" paymentsByInvoice={paymentsByInvoice} />
                )}
                {paidInvoices.length > 0 && (
                  <InvoiceGroup label="Payées" invoices={paidInvoices} accent="emerald" paymentsByInvoice={paymentsByInvoice} />
                )}
                {otherInvoices.length > 0 && (
                  <InvoiceGroup label="Autres" invoices={otherInvoices} accent="gray" paymentsByInvoice={paymentsByInvoice} />
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

type InvoiceRow = { id: string; invoice_number: string; amount_cents: number; amount_paid_cents: number | null; currency: string; status: string; due_on: string | null; paid_at: string | null };
type PaymentRow = { id: string; invoice_id: string; amount_cents: number; paid_on: string; method: string | null; reference: string | null; notes: string | null };

function InvoiceGroup({ label, invoices, accent, paymentsByInvoice }: { label: string; invoices: InvoiceRow[]; accent: string; paymentsByInvoice: Map<string, PaymentRow[]> }) {
  const border = { red: "border-red-200", amber: "border-amber-200", emerald: "border-emerald-200", gray: "border-bcp-border" }[accent] ?? "border-bcp-border";
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-bcp-muted">{label}</p>
      <div className={`divide-y divide-bcp-border rounded-xl border bg-white ${border}`}>
        {invoices.map((inv) => {
          const paid = inv.amount_paid_cents ?? 0;
          const remaining = Math.max(0, inv.amount_cents - paid);
          const paidPct = inv.amount_cents > 0 ? Math.min(100, Math.round((paid / inv.amount_cents) * 100)) : 0;
          const payments = paymentsByInvoice.get(inv.id) ?? [];

          return (
            <div key={inv.id} className="px-4 py-3 text-sm">
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-bcp-anthracite">{inv.invoice_number}</span>
                <div className="flex items-center gap-2">
                  {inv.due_on && (
                    <span className={`text-xs ${isOverdue(inv.due_on, inv.status) ? "font-semibold text-red-600" : "text-bcp-muted"}`}>
                      Éch. {inv.due_on}
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${invoiceStyle(inv.status)}`}>
                    {invoiceLabel(inv.status)}
                  </span>
                </div>
              </div>

              {/* Financial summary */}
              <div className="mt-2 flex flex-wrap gap-4 text-xs">
                <span className="text-bcp-muted">Total : <strong className="text-bcp-anthracite">{(inv.amount_cents / 100).toFixed(2)} {inv.currency}</strong></span>
                {paid > 0 && <span className="text-emerald-600">Payé : <strong>{(paid / 100).toFixed(2)} {inv.currency}</strong></span>}
                {remaining > 0 && inv.status !== "cancelled" && (
                  <span className="text-amber-600">Restant : <strong>{(remaining / 100).toFixed(2)} {inv.currency}</strong></span>
                )}
              </div>

              {/* Progress bar */}
              {paidPct > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 overflow-hidden rounded-full bg-bcp-surface">
                    <div
                      className={`h-full rounded-full transition-[width] ${paidPct >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-bcp-gold to-bcp-copper"}`}
                      style={{ width: `${paidPct}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-right text-[0.6rem] text-bcp-muted">{paidPct}%</p>
                </div>
              )}

              {inv.paid_at && <p className="mt-1 text-[0.65rem] text-emerald-600">Payée le {new Date(inv.paid_at).toLocaleDateString("fr-FR")}</p>}

              {/* Payment history */}
              {payments.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-bcp-muted">Paiements</p>
                  {payments.map((pay) => (
                    <div key={pay.id} className="rounded bg-bcp-surface/40 px-2.5 py-1.5 text-xs">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-medium text-emerald-700">{(pay.amount_cents / 100).toFixed(2)} TND</span>
                        <span className="text-bcp-muted">{new Date(pay.paid_on).toLocaleDateString("fr-FR")}</span>
                        {pay.method && <span className="rounded bg-bcp-surface px-1.5 py-0.5 text-[0.55rem] text-bcp-muted">{pay.method}</span>}
                        {pay.reference && <span className="text-bcp-muted">Réf: {pay.reference}</span>}
                      </div>
                      {pay.notes && <p className="mt-1 text-[0.65rem] italic text-bcp-muted">{pay.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
