"use client";

import { useRef, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  reorderProjectStages,
  reorderTasksInStage,
  moveTaskToStage,
  addStage,
  addTask,
  addSubtask,
  editStage,
  deleteStage,
  updateStageStatus,
  editTask,
  deleteTask,
  updateTaskStatus,
  assignTask,
  editSubtask,
  deleteSubtask,
  updateSubtaskStatus,
} from "@/app/admin/actions";
import { workItemStyle, isOverdue } from "@/lib/status";

/* ────────── Types ────────── */

type SubtaskItem = {
  id: string;
  title: string;
  status: string;
  sort_order: number;
};
type TaskItem = {
  id: string;
  title: string;
  sort_order: number;
  status?: string;
  due_on?: string | null;
  assigned_to?: string | null;
  assignee_name?: string | null;
  subtasks?: SubtaskItem[];
};
type StageItem = {
  id: string;
  title: string;
  sort_order: number;
  status?: string;
  project_tasks: TaskItem[] | null;
};
type MemberRef = { user_id: string; name: string };

const WORK_STATUSES = ["pending", "in_progress", "completed", "delayed", "cancelled"] as const;
const WORK_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  in_progress: "En cours",
  completed: "Terminé",
  delayed: "En retard",
  cancelled: "Annulé",
};

/* ────────── Helpers ────────── */

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function statusDotColor(status?: string): string {
  switch (status) {
    case "completed": return "bg-emerald-500";
    case "in_progress": return "bg-blue-500";
    case "delayed": return "bg-red-500";
    case "cancelled": return "bg-zinc-400";
    default: return "bg-zinc-300";
  }
}

function stageBorderColor(status?: string): string {
  switch (status) {
    case "completed": return "border-t-emerald-500";
    case "in_progress": return "border-t-blue-500";
    case "delayed": return "border-t-red-500";
    case "cancelled": return "border-t-zinc-400";
    default: return "border-t-bcp-gold";
  }
}

/* ────────── Inline Add Input ────────── */

function InlineAddForm({
  projectId,
  action,
  hiddenFields,
  placeholder,
}: {
  projectId: string;
  action: (fd: FormData) => void;
  hiddenFields?: Record<string, string>;
  placeholder: string;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      action={(fd) => {
        action(fd);
        setValue("");
      }}
      className="flex items-center gap-1 px-2 py-1.5"
    >
      <input type="hidden" name="project_id" value={projectId} />
      {hiddenFields &&
        Object.entries(hiddenFields).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
      <input
        name="title"
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-b border-bcp-border bg-transparent px-1 py-1 text-xs text-bcp-anthracite placeholder:text-bcp-muted/50 focus:border-bcp-gold focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded px-2 py-0.5 text-[0.6rem] font-semibold text-bcp-gold hover:bg-bcp-surface"
      >
        +
      </button>
    </form>
  );
}

/* ────────── Subtask Row ────────── */

function SubtaskRow({
  subtask,
  projectId,
}: {
  subtask: SubtaskItem;
  projectId: string;
}) {
  const [editing, setEditing] = useState(false);
  const isDone = subtask.status === "completed";

  return (
    <div className="group flex items-center gap-1.5 rounded px-1.5 py-1 text-[0.65rem] hover:bg-bcp-surface/50">
      <form action={updateSubtaskStatus} className="flex items-center">
        <input type="hidden" name="project_id" value={projectId} />
        <input type="hidden" name="subtask_id" value={subtask.id} />
        <input type="hidden" name="status" value={isDone ? "pending" : "completed"} />
        <button
          type="submit"
          className={`h-3.5 w-3.5 shrink-0 rounded border ${isDone ? "border-emerald-500 bg-emerald-500 text-white" : "border-bcp-border hover:border-emerald-400"} flex items-center justify-center`}
        >
          {isDone && <span className="text-[0.5rem] leading-none">&#10003;</span>}
        </button>
      </form>

      {editing ? (
        <form action={editSubtask} onSubmit={() => setEditing(false)} className="flex flex-1 items-center gap-1">
          <input type="hidden" name="project_id" value={projectId} />
          <input type="hidden" name="subtask_id" value={subtask.id} />
          <input name="title" defaultValue={subtask.title} required autoFocus className="flex-1 rounded border border-bcp-border px-1 py-0.5 text-[0.65rem]" />
          <button type="submit" className="text-[0.55rem] text-bcp-gold">OK</button>
          <button type="button" onClick={() => setEditing(false)} className="text-[0.55rem] text-bcp-muted">✕</button>
        </form>
      ) : (
        <>
          <span className={`flex-1 ${isDone ? "text-bcp-muted line-through" : "text-bcp-anthracite"}`}>{subtask.title}</span>
          <button type="button" onClick={() => setEditing(true)} className="hidden text-bcp-muted hover:text-bcp-anthracite group-hover:inline-block">✎</button>
          <form action={deleteSubtask} className="hidden group-hover:inline-block">
            <input type="hidden" name="project_id" value={projectId} />
            <input type="hidden" name="subtask_id" value={subtask.id} />
            <button type="submit" className="text-red-400 hover:text-red-600">✕</button>
          </form>
        </>
      )}
    </div>
  );
}

/* ────────── Expandable Task Card ────────── */

function ExpandableTaskCard({
  task,
  projectId,
  members,
  dragHandleProps,
  style,
  nodeRef,
  isDragging,
}: {
  task: TaskItem;
  projectId: string;
  members: MemberRef[];
  dragHandleProps: Record<string, unknown>;
  style: React.CSSProperties;
  nodeRef: (node: HTMLElement | null) => void;
  isDragging: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingTask, setEditingTask] = useState(false);

  const overdue = task.due_on && task.status ? isOverdue(task.due_on, task.status) : false;
  const statusCls = task.status ? workItemStyle(task.status) : "";
  const leftBorder = task.status === "completed"
    ? "border-l-emerald-500"
    : task.status === "in_progress"
      ? "border-l-blue-500"
      : task.status === "delayed"
        ? "border-l-red-500"
        : "border-l-transparent";

  const subtasksDone = (task.subtasks ?? []).filter((s) => s.status === "completed").length;
  const subtasksTotal = (task.subtasks ?? []).length;

  return (
    <div ref={nodeRef} style={{ ...style, opacity: isDragging ? 0.4 : 1 }} className={`rounded-lg border border-l-[3px] ${leftBorder} ${overdue ? "border-red-200 bg-red-50/40" : "border-bcp-border bg-white"} transition hover:shadow-sm`}>
      {/* Compact header */}
      <div className="flex items-start gap-1.5 px-3 py-2" {...dragHandleProps}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="mt-0.5 shrink-0 text-[0.6rem] text-bcp-muted hover:text-bcp-anthracite"
        >
          {expanded ? "▾" : "▸"}
        </button>
        {task.status && <span className={`mt-1 inline-block h-2 w-2 shrink-0 rounded-full ${statusCls.split(" ")[0]}`} />}
        <span className="flex-1 cursor-pointer text-xs font-medium leading-snug text-bcp-anthracite" onClick={() => setExpanded(!expanded)}>{task.title}</span>
        {subtasksTotal > 0 && (
          <span className="shrink-0 rounded-full bg-bcp-surface px-1.5 text-[0.55rem] tabular-nums text-bcp-muted">
            {subtasksDone}/{subtasksTotal}
          </span>
        )}
        {task.assignee_name && (
          <span className="ml-auto shrink-0 rounded-full bg-bcp-navy px-1.5 py-0.5 text-[0.55rem] font-bold text-white" title={task.assignee_name}>
            {getInitials(task.assignee_name)}
          </span>
        )}
      </div>
      {(task.due_on || overdue) && !expanded && (
        <p className={`px-3 pb-1.5 text-[0.6rem] ${overdue ? "font-semibold text-red-600" : "text-bcp-muted"}`}>
          {overdue && "⚠ "}Éch. {task.due_on}
        </p>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-bcp-border/60 px-3 py-2 text-xs">
          {/* Task inline edit */}
          {editingTask ? (
            <form action={editTask} onSubmit={() => setEditingTask(false)} className="mb-2 space-y-1.5">
              <input type="hidden" name="project_id" value={projectId} />
              <input type="hidden" name="task_id" value={task.id} />
              <input name="title" defaultValue={task.title} required className="w-full rounded border border-bcp-border px-2 py-1 text-xs" autoFocus />
              <input name="due_on" type="date" defaultValue={task.due_on ?? ""} className="rounded border border-bcp-border px-2 py-1 text-xs" />
              <div className="flex gap-1">
                <button type="submit" className="rounded bg-bcp-navy px-2 py-0.5 text-[0.65rem] text-white">Enregistrer</button>
                <button type="button" onClick={() => setEditingTask(false)} className="text-[0.65rem] text-bcp-muted">Annuler</button>
              </div>
            </form>
          ) : (
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {/* Status */}
              <form action={updateTaskStatus} className="flex items-center gap-1">
                <input type="hidden" name="project_id" value={projectId} />
                <input type="hidden" name="task_id" value={task.id} />
                <select
                  name="status"
                  defaultValue={task.status || "pending"}
                  onChange={(e) => e.currentTarget.form?.requestSubmit()}
                  className="rounded border border-bcp-border px-1.5 py-0.5 text-[0.65rem]"
                >
                  {WORK_STATUSES.map((s) => (
                    <option key={s} value={s}>{WORK_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </form>

              {/* Assignee */}
              <form action={assignTask} className="flex items-center gap-1">
                <input type="hidden" name="project_id" value={projectId} />
                <input type="hidden" name="task_id" value={task.id} />
                <select
                  name="assigned_to"
                  defaultValue={task.assigned_to || ""}
                  onChange={(e) => e.currentTarget.form?.requestSubmit()}
                  className="max-w-[120px] rounded border border-bcp-border px-1.5 py-0.5 text-[0.65rem]"
                >
                  <option value="">Non assigné</option>
                  {members.map((m) => (
                    <option key={m.user_id} value={m.user_id}>{m.name}</option>
                  ))}
                </select>
              </form>

              {task.due_on && (
                <span className={`text-[0.6rem] ${overdue ? "font-semibold text-red-600" : "text-bcp-muted"}`}>
                  Éch. {task.due_on}
                </span>
              )}

              <button type="button" onClick={() => setEditingTask(true)} className="text-[0.6rem] text-bcp-muted hover:text-bcp-anthracite">✎ Modifier</button>
              <form action={deleteTask}>
                <input type="hidden" name="project_id" value={projectId} />
                <input type="hidden" name="task_id" value={task.id} />
                <button type="submit" className="text-[0.6rem] text-red-400 hover:text-red-600">Supprimer</button>
              </form>
            </div>
          )}

          {/* Subtasks */}
          <div className="space-y-0.5">
            {(task.subtasks ?? []).map((st) => (
              <SubtaskRow key={st.id} subtask={st} projectId={projectId} />
            ))}
          </div>
          {(task.subtasks ?? []).length === 0 && (
            <p className="py-1 text-[0.6rem] text-bcp-muted">Aucune sous-tâche</p>
          )}
          <InlineAddForm
            projectId={projectId}
            action={addSubtask}
            hiddenFields={{ task_id: task.id }}
            placeholder="+ Sous-tâche"
          />
        </div>
      )}
    </div>
  );
}

/* ────────── Sortable Task wrapper ────────── */

function SortableTask({
  task,
  projectId,
  members,
}: {
  task: TaskItem;
  projectId: string;
  members: MemberRef[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { type: "task", stageId: "" } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <ExpandableTaskCard
      task={task}
      projectId={projectId}
      members={members}
      dragHandleProps={{ ...attributes, ...listeners } as Record<string, unknown>}
      style={style}
      nodeRef={setNodeRef}
      isDragging={isDragging}
    />
  );
}

/** Hit target when a stage has no tasks (SortableContext with empty items). */
function EmptyStageDropTarget({ stageId }: { stageId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-empty-${stageId}`,
    data: { type: "stage", stageId },
  });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[140px] flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-bcp-border/60 px-2 py-6 ${
        isOver ? "border-bcp-gold/80 bg-bcp-gold/10" : ""
      }`}
    >
      <p className="text-[0.65rem] text-bcp-muted">Glisser une tâche ici</p>
    </div>
  );
}

/* ────────── Stage Column ────────── */

function SortableStage({
  stage,
  projectId,
  members,
  children,
}: {
  stage: StageItem;
  projectId: string;
  members: MemberRef[];
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stage.id, data: { type: "stage" } });
  const [showMenu, setShowMenu] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const taskCount = (stage.project_tasks ?? []).length;
  const doneCount = (stage.project_tasks ?? []).filter((t) => t.status === "completed").length;
  const borderTop = stageBorderColor(stage.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex w-72 shrink-0 flex-col rounded-xl border ${borderTop} border-t-[3px] border-bcp-border bg-white shadow-sm`}
    >
      {/* Header */}
      <div className="relative px-3 py-2.5">
        <div className="flex items-center gap-2" {...attributes} {...listeners}>
          {!editingTitle ? (
            <>
              <span className={`h-2 w-2 shrink-0 rounded-full ${statusDotColor(stage.status)}`} />
              <h3 className="flex-1 cursor-grab text-xs font-bold uppercase tracking-wide text-bcp-anthracite">
                {stage.title}
              </h3>
              <span className="rounded-full bg-bcp-surface px-1.5 py-0.5 text-[0.6rem] tabular-nums text-bcp-muted">
                {doneCount}/{taskCount}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="shrink-0 rounded p-0.5 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite"
              >
                ⋯
              </button>
            </>
          ) : (
            <form action={editStage} onSubmit={() => setEditingTitle(false)} className="flex flex-1 items-center gap-1">
              <input type="hidden" name="project_id" value={projectId} />
              <input type="hidden" name="stage_id" value={stage.id} />
              <input name="title" defaultValue={stage.title} required autoFocus className="flex-1 rounded border border-bcp-border px-1.5 py-0.5 text-xs font-semibold" />
              <button type="submit" className="text-[0.6rem] font-medium text-bcp-gold">OK</button>
              <button type="button" onClick={() => setEditingTitle(false)} className="text-[0.6rem] text-bcp-muted">✕</button>
            </form>
          )}
        </div>

        {taskCount > 0 && (
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-bcp-surface">
            <div className="h-full rounded-full bg-gradient-to-r from-bcp-gold to-bcp-copper transition-[width]" style={{ width: `${Math.round((doneCount / taskCount) * 100)}%` }} />
          </div>
        )}

        {/* Actions dropdown */}
        {showMenu && (
          <div className="absolute right-2 top-full z-20 mt-1 w-40 rounded-lg border border-bcp-border bg-white py-1 shadow-lg" onMouseLeave={() => setShowMenu(false)}>
            <button type="button" onClick={() => { setEditingTitle(true); setShowMenu(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-bcp-surface">
              ✎ Renommer
            </button>
            {/* Status submenu */}
            <div className="border-t border-bcp-border/50 px-3 py-1.5">
              <span className="text-[0.6rem] font-medium uppercase text-bcp-muted">Statut</span>
              <form action={updateStageStatus} className="mt-1">
                <input type="hidden" name="project_id" value={projectId} />
                <input type="hidden" name="stage_id" value={stage.id} />
                <select
                  name="status"
                  defaultValue={stage.status || "pending"}
                  onChange={(e) => { e.currentTarget.form?.requestSubmit(); setShowMenu(false); }}
                  className="w-full rounded border border-bcp-border px-1.5 py-1 text-xs"
                >
                  {WORK_STATUSES.map((s) => (
                    <option key={s} value={s}>{WORK_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </form>
            </div>
            <form action={deleteStage}>
              <input type="hidden" name="project_id" value={projectId} />
              <input type="hidden" name="stage_id" value={stage.id} />
              <button type="submit" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-red-500 hover:bg-red-50">
                ✕ Supprimer l&apos;étape
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Task list */}
      <div className="flex min-h-[120px] flex-1 flex-col gap-1.5 px-2 py-1">{children}</div>

      {/* Inline add task */}
      <div className="border-t border-bcp-border/50">
        <InlineAddForm
          projectId={projectId}
          action={addTask}
          hiddenFields={{ stage_id: stage.id }}
          placeholder="+ Nouvelle tâche"
        />
      </div>
    </div>
  );
}

/* ────────── Ghost "Add Stage" Column ────────── */

function AddStageColumn({ projectId }: { projectId: string }) {
  const [active, setActive] = useState(false);

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className="flex h-24 w-72 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-bcp-border/60 bg-bcp-surface/20 text-xs font-semibold text-bcp-muted transition hover:border-bcp-gold hover:text-bcp-gold"
      >
        + Nouvelle étape
      </button>
    );
  }

  return (
    <div className="w-72 shrink-0 rounded-xl border border-bcp-border bg-white p-3 shadow-sm">
      <form action={addStage} onSubmit={() => setActive(false)} className="space-y-2">
        <input type="hidden" name="project_id" value={projectId} />
        <input name="title" required autoFocus placeholder="Nom de l'étape" className="w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
        <div className="flex gap-2">
          <button type="submit" className="rounded-full bg-bcp-navy px-3 py-1.5 text-xs font-semibold text-white">Ajouter</button>
          <button type="button" onClick={() => setActive(false)} className="text-xs text-bcp-muted hover:text-bcp-anthracite">Annuler</button>
        </div>
      </form>
    </div>
  );
}

/* ────────── Main Kanban Board ────────── */

export function AdminKanbanBoard({
  projectId,
  stages: initialStages,
  members = [],
}: {
  projectId: string;
  stages: StageItem[];
  members?: MemberRef[];
}) {
  const [stages, setStages] = useState<StageItem[]>(
    () => [...initialStages].sort((a, b) => a.sort_order - b.sort_order),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"stage" | "task" | null>(null);
  const [, startTransition] = useTransition();

  const prevStagesRef = useRef(stages);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const stageIds = stages.map((s) => s.id);

  function findStageOfTask(taskId: string): string | null {
    for (const s of stages) {
      if ((s.project_tasks ?? []).some((t) => t.id === taskId)) return s.id;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const data = active.data.current;
    prevStagesRef.current = stages;
    if (data?.type === "stage") {
      setActiveId(active.id as string);
      setActiveType("stage");
    } else {
      setActiveId(active.id as string);
      setActiveType("task");
    }
  }

  function handleDragOver(event: DragOverEvent) {
    if (activeType !== "task") return;
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = active.id as string;
    const overData = over.data.current;

    const fromStageId = findStageOfTask(activeTaskId);
    let toStageId: string | null = null;

    if (overData?.type === "stage") {
      toStageId = (overData.stageId as string | undefined) ?? (over.id as string);
    } else {
      toStageId = findStageOfTask(over.id as string);
    }

    if (!fromStageId || !toStageId || fromStageId === toStageId) return;

    setStages((prev) => {
      const next = prev.map((s) => ({ ...s, project_tasks: [...(s.project_tasks ?? [])] }));
      const srcStage = next.find((s) => s.id === fromStageId)!;
      const dstStage = next.find((s) => s.id === toStageId)!;
      const taskIdx = srcStage.project_tasks.findIndex((t) => t.id === activeTaskId);
      if (taskIdx === -1) return prev;
      const [task] = srcStage.project_tasks.splice(taskIdx, 1);
      dstStage.project_tasks.push(task);
      return next;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) {
      setStages(prevStagesRef.current);
      return;
    }

    if (activeType === "stage") {
      const oldIdx = stages.findIndex((s) => s.id === active.id);
      const newIdx = stages.findIndex((s) => s.id === over.id);
      if (oldIdx !== newIdx) {
        const reordered = arrayMove(stages, oldIdx, newIdx);
        setStages(reordered);
        startTransition(() => {
          const fd = new FormData();
          fd.set("project_id", projectId);
          fd.set("ordered_stage_ids", JSON.stringify(reordered.map((s) => s.id)));
          reorderProjectStages(fd);
        });
      }
      return;
    }

    const taskId = active.id as string;
    const srcStageId = findStageOfTask(taskId);
    if (!srcStageId) return;

    const overData = over.data.current;
    let targetStageId = srcStageId;
    if (overData?.type === "stage") {
      targetStageId = (overData.stageId as string | undefined) ?? (over.id as string);
    } else {
      targetStageId = findStageOfTask(over.id as string) ?? srcStageId;
    }

    const prevSrcStageId = prevStagesRef.current.find((s) =>
      (s.project_tasks ?? []).some((t) => t.id === taskId),
    )?.id;

    if (targetStageId === srcStageId) {
      const stage = stages.find((s) => s.id === srcStageId)!;
      const tasks = [...(stage.project_tasks ?? [])];
      const oldIdx = tasks.findIndex((t) => t.id === active.id);
      const newIdx = tasks.findIndex((t) => t.id === over.id);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        const reordered = arrayMove(tasks, oldIdx, newIdx);
        setStages((prev) =>
          prev.map((s) => (s.id === srcStageId ? { ...s, project_tasks: reordered } : s)),
        );
        startTransition(() => {
          const fd = new FormData();
          fd.set("project_id", projectId);
          fd.set("stage_id", srcStageId);
          fd.set("ordered_task_ids", JSON.stringify(reordered.map((t) => t.id)));
          reorderTasksInStage(fd);
        });
      } else if (prevSrcStageId && prevSrcStageId !== srcStageId) {
        persistCrossStageMove(taskId, prevSrcStageId, srcStageId);
      }
    } else {
      persistCrossStageMove(taskId, srcStageId, targetStageId);
    }
  }

  function persistCrossStageMove(
    taskId: string,
    sourceStageId: string,
    destStageId: string,
  ) {
    const srcStage = stages.find((s) => s.id === sourceStageId);
    const dstStage = stages.find((s) => s.id === destStageId);
    startTransition(() => {
      const fd = new FormData();
      fd.set("project_id", projectId);
      fd.set("task_id", taskId);
      fd.set("new_stage_id", destStageId);
      fd.set("source_stage_id", sourceStageId);
      fd.set(
        "ordered_task_ids_in_target",
        JSON.stringify((dstStage?.project_tasks ?? []).map((t) => t.id)),
      );
      fd.set(
        "ordered_task_ids_in_source",
        JSON.stringify(
          (srcStage?.project_tasks ?? []).filter((t) => t.id !== taskId).map((t) => t.id),
        ),
      );
      moveTaskToStage(fd);
    });
  }

  function handleDragCancel() {
    setStages(prevStagesRef.current);
    setActiveId(null);
    setActiveType(null);
  }

  const activeTask =
    activeType === "task" && activeId
      ? stages.flatMap((s) => s.project_tasks ?? []).find((t) => t.id === activeId)
      : null;

  const activeStage =
    activeType === "stage" && activeId
      ? stages.find((s) => s.id === activeId)
      : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        <SortableContext items={stageIds} strategy={horizontalListSortingStrategy}>
          {stages.map((stage) => {
            const tasks = [...(stage.project_tasks ?? [])].sort(
              (a, b) => a.sort_order - b.sort_order,
            );
            return (
              <SortableStage key={stage.id} stage={stage} projectId={projectId} members={members}>
                <SortableContext
                  items={tasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {tasks.length === 0 ? (
                    <EmptyStageDropTarget stageId={stage.id} />
                  ) : (
                    tasks.map((task) => (
                      <SortableTask key={task.id} task={task} projectId={projectId} members={members} />
                    ))
                  )}
                </SortableContext>
              </SortableStage>
            );
          })}
        </SortableContext>

        <AddStageColumn projectId={projectId} />
      </div>

      <DragOverlay>
        {activeStage ? (
          <div className="w-72 rounded-xl border border-bcp-gold bg-white p-3 shadow-lg">
            <p className="text-xs font-semibold uppercase text-bcp-anthracite">
              {activeStage.title}
            </p>
          </div>
        ) : activeTask ? (
          <div className="rounded-lg border border-bcp-gold bg-white px-3 py-2 text-xs font-medium text-bcp-anthracite shadow-lg">
            {activeTask.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
