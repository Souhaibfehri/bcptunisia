"use client";

import { useEffect, useState } from "react";

type ServerAction = (formData: FormData) => Promise<void>;

type Props = {
  action: ServerAction;
  confirmLabel: string;
  /** Value the user must type exactly (case-insensitive), e.g. email. */
  confirmPlaceholder: string;
  hiddenFields: Record<string, string>;
  buttonText?: string;
  triggerClassName?: string;
  triggerLabel?: string;
};

export function ConfirmDeleteModal({
  action,
  confirmLabel,
  confirmPlaceholder,
  hiddenFields,
  buttonText = "Supprimer définitivement",
  triggerClassName = "text-xs text-red-500 hover:text-red-700 font-medium",
  triggerLabel = "Supprimer",
}: Props) {
  const [open, setOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const expected = confirmPlaceholder.trim().toLowerCase();

  useEffect(() => {
    if (!open) {
      setLocalError(null);
    }
  }, [open]);

  async function handleAction(formData: FormData) {
    setLocalError(null);
    const typed = String(formData.get("confirm_email") ?? "").trim().toLowerCase();
    if (!typed || typed !== expected) {
      setLocalError("La confirmation ne correspond pas.");
      return;
    }
    setIsPending(true);
    try {
      await action(formData);
    } catch (e) {
      if (
        typeof e === "object" &&
        e !== null &&
        "digest" in e &&
        typeof (e as { digest: unknown }).digest === "string" &&
        String((e as { digest: string }).digest).startsWith("NEXT_REDIRECT")
      ) {
        throw e;
      }
      setLocalError("La suppression a échoué. Réessayez ou contactez un administrateur.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-bcp-anthracite">Confirmer la suppression</h3>
            <p className="mt-2 text-sm text-bcp-muted">{confirmLabel}</p>

            <form action={handleAction} className="mt-4 space-y-4">
              {Object.entries(hiddenFields).map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}
              <input
                name="confirm_email"
                type="text"
                required
                placeholder={confirmPlaceholder}
                className="w-full rounded-lg border border-bcp-border px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                autoFocus
                autoComplete="off"
                disabled={isPending}
              />

              {localError ? (
                <p className="text-sm text-red-600" role="alert">
                  {localError}
                </p>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="rounded-lg border border-bcp-border px-4 py-2 text-sm font-medium text-bcp-muted hover:bg-bcp-surface disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                >
                  {isPending ? "…" : buttonText}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
