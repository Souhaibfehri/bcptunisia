import Link from "next/link";
import type { CrmLeadActivityRow, CrmLeadNoteRow, CrmLeadRow, CrmLeadStageEventRow } from "@/lib/crm/types";
import { CRM_STAGES } from "@/lib/crm/types";
import { crmStageLabel } from "@/lib/crm/stageLabels";
import { creatorLabel, profileLabel } from "@/components/crm/CrmLeadsTable";
import {
  updateCrmLeadFromForm,
  deleteCrmLeadFromForm,
  addCrmLeadNoteFromForm,
  addCrmLeadActivityFromForm,
  markLeadContactedFromForm,
  setCrmLeadStageFromForm,
  quickAssignCrmLeadFromForm,
  quickFollowUpCrmLeadFromForm,
  quickPriorityCrmLeadFromForm,
} from "@/lib/crm/server-actions";
import { Button } from "@/components/ui/Button";
import { buttonClass } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

type Props = {
  basePath: "/admin/leads" | "/employee/leads";
  isAdminCrm: boolean;
  lead: CrmLeadRow;
  notes: CrmLeadNoteRow[];
  activities: CrmLeadActivityRow[];
  stageEvents: CrmLeadStageEventRow[];
  nameByUserId: Record<string, string>;
  assigneeOptions?: { id: string; label: string }[];
  flashError?: string;
  flashSuccess?: string;
};

type TimelineItem =
  | { sortAt: string; kind: "note"; id: string; body: string; label: string }
  | { sortAt: string; kind: "activity"; id: string; body: string; label: string; type: string }
  | { sortAt: string; kind: "stage"; id: string; body: string; label: string };

function buildTimeline(
  notes: CrmLeadNoteRow[],
  activities: CrmLeadActivityRow[],
  stageEvents: CrmLeadStageEventRow[],
  nameByUserId: Record<string, string>,
): TimelineItem[] {
  const items: TimelineItem[] = [];
  for (const n of notes) {
    items.push({
      sortAt: n.created_at,
      kind: "note",
      id: n.id,
      body: n.body,
      label: `${profileLabel(nameByUserId, n.author_id)} · note`,
    });
  }
  for (const a of activities) {
    items.push({
      sortAt: a.created_at,
      kind: "activity",
      id: a.id,
      body: a.body,
      type: a.kind,
      label: `${profileLabel(nameByUserId, a.author_id)} · ${a.kind}`,
    });
  }
  for (const s of stageEvents) {
    const from = s.from_stage ? crmStageLabel(s.from_stage) : "—";
    const to = crmStageLabel(s.to_stage);
    items.push({
      sortAt: s.created_at,
      kind: "stage",
      id: s.id,
      body: `${from} → ${to}`,
      label: s.actor_id ? profileLabel(nameByUserId, s.actor_id) : "Système",
    });
  }
  return items.sort((a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime());
}

function followUpInputValue(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function priorityLabelFr(p: string | null | undefined): string {
  const m: Record<string, string> = {
    low: "Basse",
    normal: "Normale",
    high: "Haute",
    urgent: "Urgente",
  };
  return m[p ?? "normal"] ?? (p ?? "—");
}

function activityKindLabel(kind: string): string {
  const m: Record<string, string> = {
    lead_created: "Création",
    stage_change: "Étape",
    contacted: "Contact",
    assignment_change: "Assignation",
    priority_change: "Priorité",
    follow_up_change: "Suivi",
    note_added: "Note",
  };
  return m[kind] ?? kind;
}

function followUpSummary(
  lead: CrmLeadRow,
): { text: string; className: string } | null {
  const fu = lead.follow_up_at;
  if (!fu || ["won", "lost", "archived"].includes(lead.stage)) return null;
  const d = new Date(fu);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const day = now.getDate();
  const startToday = new Date(y, m, day).getTime();
  const endToday = startToday + 24 * 60 * 60 * 1000;
  const t = d.getTime();
  const short = d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  if (t < now.getTime()) return { text: `Suivi en retard · ${short}`, className: "text-[var(--status-danger-fg)]" };
  if (t >= startToday && t < endToday) return { text: `Suivi aujourd’hui · ${short}`, className: "text-[var(--status-warning-fg)]" };
  return { text: `Prochain suivi · ${short}`, className: "text-bcp-muted" };
}

export function CrmLeadDetailView({
  basePath,
  isAdminCrm,
  lead,
  notes,
  activities,
  stageEvents,
  nameByUserId,
  assigneeOptions = [],
  flashError,
  flashSuccess,
}: Props) {
  const successMsg =
    flashSuccess === "updated"
      ? "Lead mis à jour."
      : flashSuccess === "note"
        ? "Note ajoutée."
        : flashSuccess === "activity"
          ? "Activité enregistrée."
          : flashSuccess === "contacted"
            ? "Contact enregistré."
            : flashSuccess === "stage"
              ? "Étape mise à jour."
              : flashSuccess === "quick"
                ? "Mise à jour enregistrée."
                : flashSuccess
                  ? "Enregistré."
                  : null;

  const stageValue = lead.stage === "proposal" ? "proposal_sent" : lead.stage;
  const timeline = buildTimeline(notes, activities, stageEvents, nameByUserId);
  const followUp = followUpSummary(lead);
  const latestNote = notes.length > 0 ? [...notes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : null;

  return (
    <div className="space-y-8">
      <div>
        <Link href={basePath} className="text-xs font-medium text-bcp-gold">
          ← Tous les leads
        </Link>
        <h1 className="bcp-page-title mt-2">{lead.title}</h1>
        <p className="mt-1 text-sm text-bcp-muted">
          Créé par {creatorLabel(nameByUserId, lead.created_by)} ·{" "}
          {new Date(lead.created_at).toLocaleString("fr-FR")}
        </p>
      </div>

      {flashError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{flashError}</div>
      ) : null}
      {successMsg ? (
        <div className="rounded-xl border border-bcp-gold/30 bg-bcp-cream px-4 py-3 text-sm text-bcp-anthracite">
          {successMsg}
        </div>
      ) : null}

      <Card elevated className="border-bcp-border/90">
        <SectionHeader title="Synthèse" description="Vue opérationnelle — statut, propriétaire et prochaine action." className="mb-3" />
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${lead.status === "archived" ? "border-bcp-border bg-bcp-surface text-bcp-muted" : "border-bcp-navy/15 bg-bcp-navy/8 text-bcp-navy"}`}>
            {lead.status === "archived" ? "Archivé" : "Ouvert"}
          </span>
          <span className="rounded-full border border-bcp-gold/35 bg-bcp-gold/10 px-2.5 py-0.5 text-xs font-semibold text-bcp-navy">
            {crmStageLabel(lead.stage)}
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              lead.priority === "urgent" || lead.priority === "high"
                ? "border-amber-200/90 bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]"
                : "border-bcp-border bg-bcp-surface/80 text-bcp-muted"
            }`}
          >
            Priorité {priorityLabelFr(lead.priority)}
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              !lead.assigned_to ? "border-amber-200/80 bg-amber-50/80 text-amber-950" : "border-bcp-border bg-white text-bcp-anthracite"
            }`}
          >
            {lead.assigned_to ? profileLabel(nameByUserId, lead.assigned_to) : "Non assigné"}
          </span>
          {followUp ? <span className={`text-xs font-medium ${followUp.className}`}>{followUp.text}</span> : null}
        </div>
        {latestNote ? (
          <div className="mt-4 rounded-lg border border-bcp-border/80 bg-bcp-surface/40 px-3 py-2">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-bcp-muted">Dernière note</p>
            <p className="mt-1 line-clamp-2 text-sm text-bcp-anthracite">{latestNote.body}</p>
            <p className="mt-1 text-[0.65rem] text-bcp-muted">
              {profileLabel(nameByUserId, latestNote.author_id)} · {new Date(latestNote.created_at).toLocaleString("fr-FR")}
            </p>
          </div>
        ) : null}
      </Card>

      <Card accent>
        <SectionHeader
          title="Actions rapides"
          description="Notes, suivi, pipe et statuts — sans passer par la fiche complète."
          className="mb-3"
        />
        <form action={addCrmLeadNoteFromForm} className="mb-4 space-y-2 border-b border-bcp-border pb-4">
          <input type="hidden" name="crm_base" value={basePath} />
          <input type="hidden" name="lead_id" value={lead.id} />
          <label className="text-xs font-medium text-bcp-anthracite">Ajouter une note</label>
          <textarea name="body" required rows={2} placeholder="Note interne…" className="bcp-input" />
          <button type="submit" className={buttonClass({ variant: "primary", size: "sm" })}>
            Publier la note
          </button>
        </form>
        <div className="mb-4 grid gap-3 border-b border-bcp-border pb-4 sm:grid-cols-2 lg:grid-cols-3">
          <form action={quickFollowUpCrmLeadFromForm} className="space-y-1">
            <input type="hidden" name="crm_base" value={basePath} />
            <input type="hidden" name="lead_id" value={lead.id} />
            <label className="text-xs font-medium text-bcp-muted">Prochain suivi</label>
            <input name="follow_up_at" type="datetime-local" defaultValue={followUpInputValue(lead.follow_up_at)} className="bcp-input" />
            <button type="submit" className={buttonClass({ variant: "secondary", size: "sm", className: "w-full" })}>
              Enregistrer le suivi
            </button>
          </form>
          <form action={quickPriorityCrmLeadFromForm} className="space-y-1">
            <input type="hidden" name="crm_base" value={basePath} />
            <input type="hidden" name="lead_id" value={lead.id} />
            <label className="text-xs font-medium text-bcp-muted">Priorité</label>
            <select name="priority" defaultValue={lead.priority ?? "normal"} className="bcp-input">
              <option value="low">Basse</option>
              <option value="normal">Normale</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
            <button type="submit" className={buttonClass({ variant: "secondary", size: "sm", className: "w-full" })}>
              Appliquer
            </button>
          </form>
          <form action={setCrmLeadStageFromForm} className="space-y-1 sm:col-span-2 lg:col-span-1">
            <input type="hidden" name="crm_base" value={basePath} />
            <input type="hidden" name="lead_id" value={lead.id} />
            <label className="text-xs font-medium text-bcp-muted">Étape du pipe</label>
            <select name="to_stage" defaultValue={stageValue} className="bcp-input">
              {CRM_STAGES.map((s) => (
                <option key={s} value={s}>
                  {crmStageLabel(s)}
                </option>
              ))}
            </select>
            <button type="submit" className={buttonClass({ variant: "secondary", size: "sm", className: "w-full" })}>
              Changer l&apos;étape
            </button>
          </form>
          {isAdminCrm ? (
            <form action={quickAssignCrmLeadFromForm} className="space-y-1 sm:col-span-2 lg:col-span-3">
              <input type="hidden" name="crm_base" value={basePath} />
              <input type="hidden" name="lead_id" value={lead.id} />
              <label className="text-xs font-medium text-bcp-muted">Assigné à</label>
              <div className="flex flex-wrap gap-2">
                <select name="assigned_to" defaultValue={lead.assigned_to ?? ""} className="bcp-input min-w-[12rem] flex-1">
                  <option value="">— Non assigné —</option>
                  {assigneeOptions.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
                </select>
                <button type="submit" className={buttonClass({ variant: "secondary", size: "sm" })}>
                  Assigner
                </button>
              </div>
            </form>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={markLeadContactedFromForm}>
            <input type="hidden" name="crm_base" value={basePath} />
            <input type="hidden" name="lead_id" value={lead.id} />
            <button type="submit" className={buttonClass({ variant: "secondary", size: "sm" })}>
              Marquer contacté
            </button>
          </form>
          <form action={setCrmLeadStageFromForm}>
            <input type="hidden" name="crm_base" value={basePath} />
            <input type="hidden" name="lead_id" value={lead.id} />
            <input type="hidden" name="to_stage" value="won" />
            <button
              type="submit"
              className={buttonClass({ variant: "primary", size: "sm", className: "!bg-emerald-700 hover:!bg-emerald-800" })}
            >
              Gagné
            </button>
          </form>
          <form action={setCrmLeadStageFromForm}>
            <input type="hidden" name="crm_base" value={basePath} />
            <input type="hidden" name="lead_id" value={lead.id} />
            <input type="hidden" name="to_stage" value="lost" />
            <button
              type="submit"
              className={buttonClass({ variant: "primary", size: "sm", className: "!bg-bcp-slate hover:!bg-bcp-navy" })}
            >
              Perdu
            </button>
          </form>
          <form action={setCrmLeadStageFromForm}>
            <input type="hidden" name="crm_base" value={basePath} />
            <input type="hidden" name="lead_id" value={lead.id} />
            <input type="hidden" name="to_stage" value="archived" />
            <button type="submit" className={buttonClass({ variant: "ghost", size: "sm" })}>
              Archiver
            </button>
          </form>
        </div>
      </Card>

      {(lead.source_type || lead.source_page || lead.message) && (
        <Card className="border-bcp-gold/20 bg-gradient-to-br from-bcp-cream/40 to-white" padding="md">
          <SectionHeader title="Origine & demande" className="mb-3" />
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {lead.source_type ? (
              <>
                <dt className="text-xs text-bcp-muted">Source</dt>
                <dd>{lead.source_type}</dd>
              </>
            ) : null}
            {lead.source_form ? (
              <>
                <dt className="text-xs text-bcp-muted">Formulaire</dt>
                <dd>{lead.source_form}</dd>
              </>
            ) : null}
            {lead.source_page ? (
              <>
                <dt className="text-xs text-bcp-muted">Page</dt>
                <dd className="break-all">{lead.source_page}</dd>
              </>
            ) : null}
            {lead.locale ? (
              <>
                <dt className="text-xs text-bcp-muted">Langue</dt>
                <dd>{lead.locale}</dd>
              </>
            ) : null}
            {lead.request_type ? (
              <>
                <dt className="text-xs text-bcp-muted">Type de demande</dt>
                <dd>{lead.request_type}</dd>
              </>
            ) : null}
            {lead.service_category ? (
              <>
                <dt className="text-xs text-bcp-muted">Catégorie</dt>
                <dd>{lead.service_category}</dd>
              </>
            ) : null}
            {lead.sector ? (
              <>
                <dt className="text-xs text-bcp-muted">Secteur</dt>
                <dd>{lead.sector}</dd>
              </>
            ) : null}
            {lead.referrer ? (
              <>
                <dt className="text-xs text-bcp-muted">Référent</dt>
                <dd className="break-all text-xs">{lead.referrer}</dd>
              </>
            ) : null}
          </dl>
          {lead.message ? (
            <div className="mt-4 border-t border-bcp-border pt-4">
              <p className="text-xs font-medium text-bcp-muted">Message initial</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-bcp-anthracite">{lead.message}</p>
            </div>
          ) : null}
        </Card>
      )}

      <Card>
        <SectionHeader title="Chronologie" description="Notes, activités et mouvements d’étape." className="mb-4" />
        <ul className="space-y-3">
          {timeline.length === 0 ? (
            <li className="rounded-lg border border-dashed border-bcp-border bg-bcp-surface/25 px-4 py-6 text-center text-sm text-bcp-muted">
              Aucun événement.
            </li>
          ) : (
            timeline.map((t) => (
              <li
                key={`${t.kind}-${t.id}`}
                className="rounded-lg border border-bcp-border/80 border-l-2 border-l-bcp-gold/70 bg-gradient-to-r from-bcp-cream/20 to-white px-3 py-2.5 text-sm shadow-sm"
              >
                <div className="text-xs text-bcp-muted">
                  <span className="font-medium text-bcp-navy">
                    {t.kind === "note"
                      ? "Note"
                      : t.kind === "stage"
                        ? "Étape"
                        : t.kind === "activity"
                          ? activityKindLabel(t.type)
                          : "Événement"}
                  </span>{" "}
                  · {t.label} · {new Date(t.sortAt).toLocaleString("fr-FR")}
                </div>
                <p className="mt-1 text-bcp-anthracite">{t.body}</p>
              </li>
            ))
          )}
        </ul>
      </Card>

      <Card accent>
        <SectionHeader title="Fiche" description="Coordonnées, pipe et suivi — enregistrez pour appliquer les changements." className="mb-4" />
        <form action={updateCrmLeadFromForm} className="mt-4 max-w-2xl space-y-3">
          <input type="hidden" name="crm_base" value={basePath} />
          <input type="hidden" name="lead_id" value={lead.id} />
          <div>
            <label className="text-xs font-medium text-bcp-muted">Titre *</label>
            <input
              name="title"
              required
              defaultValue={lead.title}
              className="mt-1 bcp-input"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Société</label>
            <input
              name="company_name"
              defaultValue={lead.company_name ?? ""}
              className="mt-1 bcp-input"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-bcp-muted">Contact</label>
              <input
                name="contact_name"
                defaultValue={lead.contact_name ?? ""}
                className="mt-1 bcp-input"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Téléphone</label>
              <input
                name="contact_phone"
                defaultValue={lead.contact_phone ?? ""}
                className="mt-1 bcp-input"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">E-mail</label>
            <input
              name="contact_email"
              type="email"
              defaultValue={lead.contact_email ?? ""}
              className="mt-1 bcp-input"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-bcp-muted">Étape</label>
              <select
                name="stage"
                defaultValue={stageValue}
                className="mt-1 bcp-input"
              >
                {CRM_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {crmStageLabel(s)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Priorité</label>
              <select
                name="priority"
                defaultValue={lead.priority ?? "normal"}
                className="mt-1 bcp-input"
              >
                <option value="low">Basse</option>
                <option value="normal">Normale</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Statut dossier</label>
            <select
              name="status"
              defaultValue={lead.status ?? "open"}
              className="mt-1 bcp-input"
            >
              <option value="open">Ouvert</option>
              <option value="archived">Archivé</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Prochain suivi</label>
            <input
              name="follow_up_at"
              type="datetime-local"
              defaultValue={followUpInputValue(lead.follow_up_at)}
              className="mt-1 bcp-input"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Raison si perdu</label>
            <input
              name="lost_reason"
              defaultValue={lead.lost_reason ?? ""}
              className="mt-1 bcp-input"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Notes internes (n&apos;écrase pas le message client)</label>
            <textarea
              name="internal_notes"
              rows={4}
              defaultValue={lead.internal_notes ?? ""}
              className="mt-1 bcp-input"
            />
          </div>
          {isAdminCrm ? (
            <div>
              <label className="text-xs font-medium text-bcp-muted">Assigné à</label>
              <select
                name="assigned_to"
                defaultValue={lead.assigned_to ?? ""}
                className="mt-1 bcp-input"
              >
                <option value="">— Non assigné —</option>
                {assigneeOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <Button type="submit" variant="primary" size="md">
            Enregistrer
          </Button>
        </form>

        {isAdminCrm ? (
          <form action={deleteCrmLeadFromForm} className="mt-6 border-t border-bcp-border pt-4">
            <input type="hidden" name="crm_base" value={basePath} />
            <input type="hidden" name="lead_id" value={lead.id} />
            <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-800">
              Supprimer ce lead
            </button>
          </form>
        ) : null}
      </Card>

      <Card>
        <SectionHeader title="Activités" className="mb-4" />
        <form action={addCrmLeadActivityFromForm} className="mt-4 space-y-2">
          <input type="hidden" name="crm_base" value={basePath} />
          <input type="hidden" name="lead_id" value={lead.id} />
          <input
            name="kind"
            placeholder="Type (appel, e-mail…)"
            className="bcp-input"
          />
          <textarea
            name="body"
            required
            rows={2}
            placeholder="Détail…"
            className="bcp-input"
          />
          <Button type="submit" variant="primary" size="sm">
            Enregistrer l&apos;activité
          </Button>
        </form>
      </Card>
    </div>
  );
}
