"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { moveCrmLeadStage } from "@/lib/crm/server-actions";
import type { CrmLeadRow } from "@/lib/crm/types";
import { CRM_STAGES } from "@/lib/crm/types";
import { crmStageLabel } from "@/lib/crm/stageLabels";
import { profileLabel } from "@/components/crm/CrmLeadsTable";
import Link from "next/link";

function normalizeStage(stage: string): string {
  let k = stage === "proposal" ? "proposal_sent" : stage;
  if (!CRM_STAGES.includes(k as (typeof CRM_STAGES)[number])) k = "new";
  return k;
}

function followUpSummary(lead: CrmLeadRow): { line: string; overdue: boolean; today: boolean } | null {
  if (!lead.follow_up_at || ["won", "lost", "archived"].includes(lead.stage)) return null;
  const d = new Date(lead.follow_up_at);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const end = start + 86400000;
  const t = d.getTime();
  const overdue = t < now.getTime();
  const today = t >= start && t < end;
  const line = d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  return { line, overdue, today };
}

function DroppableColumn({
  stage,
  count,
  children,
}: {
  stage: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `stage-${stage}` });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[300px] w-[280px] shrink-0 flex-col overflow-hidden rounded-xl border bg-gradient-to-b from-bcp-surface/90 to-bcp-cream/20 shadow-sm ${
        isOver ? "border-bcp-gold ring-2 ring-bcp-gold/35" : "border-bcp-border"
      }`}
    >
      <div className="border-b border-bcp-border/80 bg-gradient-to-r from-bcp-navy/[0.06] to-bcp-gold/[0.08] px-3 py-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wide text-bcp-navy">{crmStageLabel(stage)}</h3>
        <p className="mt-0.5 text-[0.65rem] font-medium text-bcp-muted">{count} lead(s)</p>
      </div>
      <div className="flex min-h-[240px] flex-1 flex-col gap-2.5 p-2.5">{children}</div>
    </div>
  );
}

function DraggableLeadCard({
  lead,
  nameByUserId,
  basePath,
}: {
  lead: CrmLeadRow;
  nameByUserId: Record<string, string>;
  basePath: "/admin/leads" | "/employee/leads";
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  const overdue =
    lead.follow_up_at &&
    new Date(lead.follow_up_at) < new Date() &&
    !["won", "lost", "archived"].includes(lead.stage);
  const urgent = lead.priority === "high" || lead.priority === "urgent";
  const unassigned = !lead.assigned_to;
  const leftAccent = overdue
    ? "border-l-[3px] border-l-[var(--status-danger-fg)]/55"
    : urgent
      ? "border-l-[3px] border-l-amber-500/85"
      : unassigned
        ? "border-l-[3px] border-l-[var(--status-warning-fg)]/40"
        : "";
  const fu = followUpSummary(lead);
  const subtitle = lead.company_name?.trim() || lead.contact_name?.trim() || null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex gap-2 rounded-xl border border-bcp-border bg-white p-2.5 shadow-sm transition-[box-shadow,border-color] hover:border-bcp-border hover:shadow-md ${leftAccent} ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <button
        type="button"
        className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-navy active:cursor-grabbing"
        aria-label="Déplacer le lead"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <Link
          href={`${basePath}/${lead.id}`}
          className="text-sm font-semibold text-bcp-anthracite hover:text-bcp-navy"
        >
          {lead.title}
        </Link>
        {subtitle ? <p className="mt-1 text-xs text-bcp-muted">{subtitle}</p> : null}
        <div className="mt-2 flex flex-wrap gap-1 text-[0.65rem] text-bcp-muted">
          {lead.service_category ? (
            <span className="rounded bg-bcp-navy/10 px-1.5 py-0.5">{lead.service_category}</span>
          ) : null}
          {lead.request_type ? (
            <span className="rounded bg-bcp-gold/20 px-1.5 py-0.5 text-bcp-anthracite">{lead.request_type}</span>
          ) : null}
          {lead.priority === "high" || lead.priority === "urgent" ? (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-900">Priorité</span>
          ) : null}
        </div>
        <p
          className={`mt-2 text-[0.65rem] ${unassigned ? "font-semibold text-[var(--status-warning-fg)]" : "text-bcp-muted"}`}
        >
          {lead.assigned_to ? profileLabel(nameByUserId, lead.assigned_to) : "Non assigné"}
        </p>
        {fu ? (
          <p
            className={`mt-1 text-[0.65rem] ${
              fu.overdue ? "font-semibold text-red-600" : fu.today ? "font-medium text-bcp-navy" : "text-bcp-muted"
            }`}
          >
            Suivi : {fu.line}
            {fu.overdue ? " · en retard" : fu.today ? " · aujourd’hui" : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function LeadDragOverlay({
  lead,
  nameByUserId,
}: {
  lead: CrmLeadRow;
  nameByUserId: Record<string, string>;
}) {
  const subtitle = lead.company_name?.trim() || lead.contact_name?.trim() || null;
  return (
    <div className="w-[260px] cursor-grabbing rounded-xl border-2 border-bcp-gold bg-white p-3 shadow-xl">
      <p className="text-sm font-semibold text-bcp-navy">{lead.title}</p>
      {subtitle ? <p className="mt-1 text-xs text-bcp-muted">{subtitle}</p> : null}
      <p className="mt-2 text-[0.65rem] text-bcp-muted">
        {lead.assigned_to ? profileLabel(nameByUserId, lead.assigned_to) : "Non assigné"}
      </p>
    </div>
  );
}

export function CrmKanbanBoard({
  leads,
  nameByUserId,
  basePath,
}: {
  leads: CrmLeadRow[];
  nameByUserId: Record<string, string>;
  basePath: "/admin/leads" | "/employee/leads";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeLead, setActiveLead] = useState<CrmLeadRow | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const byStage = new Map<string, CrmLeadRow[]>();
  for (const s of CRM_STAGES) byStage.set(s, []);
  for (const l of leads) {
    const k = normalizeStage(l.stage);
    byStage.get(k)!.push(l);
  }

  const leadById = new Map(leads.map((l) => [l.id, l]));

  function onDragStart(e: DragStartEvent) {
    const id = String(e.active.id);
    setActiveLead(leadById.get(id) ?? null);
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveLead(null);
    const { active, over } = e;
    if (!over) return;
    const overId = String(over.id);
    if (!overId.startsWith("stage-")) return;
    const toStage = overId.replace("stage-", "");
    const leadId = String(active.id);
    const lead = leadById.get(leadId);
    if (!lead) return;
    const fromNorm = normalizeStage(lead.stage);
    if (fromNorm === toStage) return;

    startTransition(async () => {
      try {
        await moveCrmLeadStage(leadId, toStage);
        router.refresh();
      } catch (err) {
        console.error(err);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      {pending ? (
        <p className="text-xs text-bcp-muted">Mise à jour du pipeline…</p>
      ) : null}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        autoScroll={{
          threshold: { x: 0.2, y: 0.2 },
          acceleration: 10,
          interval: 5,
        }}
      >
        <div className="flex gap-3 overflow-x-auto pb-4">
          {CRM_STAGES.map((stage) => {
            const col = byStage.get(stage) ?? [];
            return (
              <DroppableColumn key={stage} stage={stage} count={col.length}>
                {col.map((lead) => (
                  <DraggableLeadCard key={lead.id} lead={lead} nameByUserId={nameByUserId} basePath={basePath} />
                ))}
                {col.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-bcp-border/80 bg-bcp-surface/20 py-8 text-center">
                    <p className="text-xs text-bcp-muted">Glisser un lead ici</p>
                  </div>
                ) : null}
              </DroppableColumn>
            );
          })}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeLead ? <LeadDragOverlay lead={activeLead} nameByUserId={nameByUserId} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
