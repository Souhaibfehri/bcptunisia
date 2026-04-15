"use client";

import { useState } from "react";
import {
  addMilestone,
  editMilestone,
  deleteMilestone,
  toggleMilestoneAchieved,
} from "@/app/admin/actions";
import { PendingSubmitButton } from "@/components/admin/PendingSubmitButton";
import { isOverdue } from "@/lib/status";

type Milestone = {
  id: string;
  title: string;
  target_on: string | null;
  achieved_at: string | null;
  sort_order: number;
};

export function MilestoneSection({
  projectId,
  milestones,
}: {
  projectId: string;
  milestones: Milestone[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-bcp-border bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Jalons</h2>

      {milestones.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-bcp-border bg-bcp-surface/30 px-4 py-6 text-center">
          <p className="text-sm text-bcp-muted">Aucun jalon défini pour ce projet.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {milestones.map((ms) => {
            const overdue = !ms.achieved_at && ms.target_on && isOverdue(ms.target_on, "pending");
            const borderColor = ms.achieved_at
              ? "border-l-emerald-500"
              : overdue
                ? "border-l-red-500"
                : "border-l-blue-400";
            const isEditing = editingId === ms.id;

            return (
              <div
                key={ms.id}
                className={`rounded-lg border border-bcp-border ${borderColor} border-l-[3px] bg-white px-4 py-3 transition hover:shadow-sm`}
              >
                {isEditing ? (
                  <form
                    action={editMilestone}
                    onSubmit={() => setEditingId(null)}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <input type="hidden" name="project_id" value={projectId} />
                    <input type="hidden" name="milestone_id" value={ms.id} />
                    <input
                      name="title"
                      defaultValue={ms.title}
                      required
                      className="min-w-[140px] flex-1 rounded-lg border border-bcp-border px-2 py-1 text-sm"
                      autoFocus
                    />
                    <input
                      name="target_on"
                      type="date"
                      defaultValue={ms.target_on ?? ""}
                      className="rounded-lg border border-bcp-border px-2 py-1 text-sm"
                    />
                    <PendingSubmitButton
                      pendingLabel="…"
                      className="min-h-9 rounded-full bg-bcp-navy px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                    >
                      Enregistrer
                    </PendingSubmitButton>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-xs text-bcp-muted hover:text-bcp-anthracite"
                    >
                      Annuler
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {ms.achieved_at ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[0.6rem] text-emerald-700">&#10003;</span>
                      ) : overdue ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-[0.6rem] text-red-600">!</span>
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[0.6rem] text-blue-600">&#9679;</span>
                      )}
                      <div>
                        <span
                          className={`text-sm font-medium ${ms.achieved_at ? "text-emerald-700 line-through" : "text-bcp-anthracite"}`}
                        >
                          {ms.title}
                        </span>
                        {ms.target_on && (
                          <span className={`ml-2 text-xs ${overdue ? "font-semibold text-red-600" : "text-bcp-muted"}`}>
                            {overdue && "En retard · "}
                            {ms.target_on}
                          </span>
                        )}
                        {ms.achieved_at && (
                          <span className="ml-2 text-xs text-emerald-600">
                            Atteint le {new Date(ms.achieved_at).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <form action={toggleMilestoneAchieved}>
                        <input type="hidden" name="project_id" value={projectId} />
                        <input type="hidden" name="milestone_id" value={ms.id} />
                        <input type="hidden" name="achieved" value={ms.achieved_at ? "false" : "true"} />
                        <PendingSubmitButton
                          pendingLabel="…"
                          className={`min-h-9 rounded-full px-2.5 py-1.5 text-[0.65rem] font-medium disabled:opacity-60 ${
                            ms.achieved_at
                              ? "bg-bcp-surface text-bcp-muted hover:text-bcp-anthracite"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {ms.achieved_at ? "Annuler" : "Atteint"}
                        </PendingSubmitButton>
                      </form>
                      <button
                        type="button"
                        onClick={() => setEditingId(ms.id)}
                        className="rounded-full px-2 py-1 text-[0.65rem] text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite"
                      >
                        Modifier
                      </button>
                      <form action={deleteMilestone}>
                        <input type="hidden" name="project_id" value={projectId} />
                        <input type="hidden" name="milestone_id" value={ms.id} />
                        <PendingSubmitButton
                          pendingLabel="…"
                          className="min-h-9 rounded-full px-2 py-1.5 text-[0.65rem] text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
                        >
                          Supprimer
                        </PendingSubmitButton>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <form action={addMilestone} className="mt-4 flex flex-wrap items-end gap-2 border-t border-bcp-border pt-4">
        <input type="hidden" name="project_id" value={projectId} />
        <div className="min-w-[160px] flex-1">
          <label className="text-xs text-bcp-muted">Nouveau jalon</label>
          <input name="title" required placeholder="Titre du jalon" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-bcp-muted">Date cible</label>
          <input name="target_on" type="date" className="mt-1 rounded-lg border border-bcp-border px-3 py-2 text-sm" />
        </div>
        <PendingSubmitButton
          pendingLabel="Ajout…"
          className="min-h-10 rounded-full bg-gradient-gold px-4 py-2 text-xs font-semibold text-bcp-anthracite shadow-sm disabled:opacity-60"
        >
          + Jalon
        </PendingSubmitButton>
      </form>
    </section>
  );
}
