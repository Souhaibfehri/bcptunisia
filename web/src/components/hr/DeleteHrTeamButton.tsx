"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { deleteHrTeam } from "@/app/admin/(hr)/hr/actions";

export function DeleteHrTeamButton({
  teamId,
  teamName,
  memberCount,
  variant = "card",
}: {
  teamId: string;
  teamName: string;
  memberCount: number;
  /** `card`: secondary outline; `detail`: red text link style */
  variant?: "card" | "detail";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) setError(null);
  }, [open]);

  if (memberCount > 0) return null;

  const triggerClass =
    variant === "detail"
      ? "text-xs font-medium text-red-600 hover:text-red-800"
      : "rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm hover:bg-red-50";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClass}>
        Supprimer l&apos;équipe
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div
            className="w-full max-w-md rounded-t-2xl border border-bcp-border bg-white p-5 shadow-xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-team-title"
          >
            <h3 id="delete-team-title" className="text-lg font-semibold text-bcp-anthracite">
              Supprimer l&apos;équipe ?
            </h3>
            <p className="mt-2 text-sm text-bcp-muted">
              L&apos;équipe « <span className="font-medium text-bcp-anthracite">{teamName}</span> » sera supprimée
              définitivement. Cette action est irréversible.
            </p>

            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                startTransition(async () => {
                  setError(null);
                  const res = await deleteHrTeam(fd);
                  if (!res.ok) {
                    setError(res.error);
                    return;
                  }
                  setOpen(false);
                  router.replace("/admin/hr/teams?success=team-deleted");
                  router.refresh();
                });
              }}
            >
              <input type="hidden" name="team_id" value={teamId} />
              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-bcp-border px-4 py-2.5 text-sm font-medium text-bcp-muted hover:bg-bcp-surface disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                >
                  {pending ? "Suppression…" : "Supprimer définitivement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
