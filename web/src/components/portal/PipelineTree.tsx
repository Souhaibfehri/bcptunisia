import { workItemStyle, workItemLabel, isOverdue } from "@/lib/status";

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

export function PipelineTree({ stages }: { stages: Stage[] }) {
  if (!stages.length) {
    return (
      <p className="rounded-xl border border-dashed border-bcp-border bg-white p-6 text-sm text-bcp-muted">
        Aucune étape définie pour ce projet pour le moment.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {stages
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((stage) => (
          <div key={stage.id} className="overflow-hidden rounded-2xl border border-bcp-border bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bcp-border bg-bcp-cream/50 px-4 py-3">
              <div>
                <h3 className="font-semibold text-bcp-anthracite">{stage.title}</h3>
                {stage.due_on && (
                  <p className="text-xs text-bcp-muted">
                    Échéance : {stage.due_on}
                    {isOverdue(stage.due_on, stage.status) && (
                      <span className="ml-2 font-medium text-red-600">(en retard)</span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${workItemStyle(stage.status)}`}>
                  {workItemLabel(stage.status)}
                </span>
                <span className="text-xs text-bcp-muted">{stage.progress_percent}%</span>
              </div>
            </div>
            <ul className="divide-y divide-bcp-border">
              {(stage.project_tasks ?? [])
                .slice()
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((task) => (
                  <li key={task.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-bcp-anthracite">{task.title}</p>
                        {task.due_on && (
                          <p className="text-xs text-bcp-muted">
                            {task.due_on}
                            {isOverdue(task.due_on, task.status) && (
                              <span className="ml-2 text-red-600">Retard</span>
                            )}
                          </p>
                        )}
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${workItemStyle(task.status)}`}>
                        {workItemLabel(task.status)}
                      </span>
                    </div>
                    {(task.project_subtasks ?? []).length > 0 && (
                      <ul className="mt-2 space-y-1 border-l-2 border-bcp-gold/30 pl-3">
                        {(task.project_subtasks ?? [])
                          .slice()
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map((st) => (
                            <li key={st.id} className="flex items-center justify-between gap-2 text-xs">
                              <span className="text-bcp-muted">{st.title}</span>
                              <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[0.6rem] font-medium ${workItemStyle(st.status)}`}>
                                {workItemLabel(st.status)}
                              </span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
