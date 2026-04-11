import { workItemStyle } from "@/lib/status";

type Subtask = {
  id: string;
  title: string;
  status: string;
  due_on: string | null;
  completed_at: string | null;
  sort_order: number;
};

type Task = {
  id: string;
  title: string;
  status: string;
  due_on: string | null;
  completed_at: string | null;
  progress_percent: number;
  sort_order: number;
  project_subtasks: Subtask[] | null;
};

type Stage = {
  id: string;
  title: string;
  status: string;
  due_on: string | null;
  completed_at: string | null;
  progress_percent: number;
  sort_order: number;
  project_tasks: Task[] | null;
};

function statusDot(status: string) {
  const map: Record<string, string> = {
    pending: "bg-zinc-300",
    in_progress: "bg-blue-400",
    completed: "bg-emerald-500",
    delayed: "bg-red-500",
    cancelled: "bg-zinc-400",
  };
  return map[status] ?? map.pending;
}

export function PortalProjectColumns({ stages }: { stages: Stage[] }) {
  if (!stages.length) {
    return (
      <p className="rounded-xl border border-dashed border-bcp-border bg-white p-6 text-sm text-bcp-muted">
        Aucune étape définie pour ce projet.
      </p>
    );
  }

  const sorted = [...stages].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-bcp-muted">Vue colonnes</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {sorted.map((stage) => {
          const tasks = [...(stage.project_tasks ?? [])].sort((a, b) => a.sort_order - b.sort_order);
          return (
            <div key={stage.id} className="flex w-64 shrink-0 flex-col rounded-xl border border-bcp-border bg-white shadow-sm">
              <div className="flex items-center justify-between gap-2 border-b border-bcp-border bg-bcp-cream/50 px-3 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-bcp-anthracite">{stage.title}</h3>
                <span className="text-[0.65rem] text-bcp-muted">{stage.progress_percent}%</span>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-2">
                {tasks.length === 0 ? (
                  <p className="px-2 py-4 text-center text-[0.65rem] text-bcp-muted">Aucune tâche</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="rounded-lg border border-bcp-border bg-bcp-surface/40 px-3 py-2">
                      <div className="flex items-start gap-2">
                        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${statusDot(task.status)}`} />
                        <span className="text-xs font-medium text-bcp-anthracite">{task.title}</span>
                      </div>
                      {(task.project_subtasks ?? []).length > 0 && (
                        <ul className="ml-4 mt-1.5 space-y-0.5 border-l border-bcp-border/60 pl-2">
                          {[...(task.project_subtasks ?? [])]
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map((st) => (
                              <li key={st.id} className="flex items-center gap-1.5 text-[0.65rem] text-bcp-muted">
                                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot(st.status)}`} />
                                {st.title}
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
