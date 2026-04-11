"use client";

import { useState, useTransition } from "react";

type Props = {
  action: (formData: FormData) => void;
  confirmLabel: string;
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
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const isMatch = value.trim().toLowerCase() === confirmPlaceholder.trim().toLowerCase();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-bcp-anthracite">Confirmer la suppression</h3>
            <p className="mt-2 text-sm text-bcp-muted">{confirmLabel}</p>

            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={confirmPlaceholder}
              className="mt-4 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
              autoFocus
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setOpen(false); setValue(""); }}
                className="rounded-lg border border-bcp-border px-4 py-2 text-sm font-medium text-bcp-muted hover:bg-bcp-surface"
              >
                Annuler
              </button>
              <form
                action={(fd) => {
                  startTransition(() => {
                    action(fd);
                    setOpen(false);
                    setValue("");
                  });
                }}
              >
                {Object.entries(hiddenFields).map(([k, v]) => (
                  <input key={k} type="hidden" name={k} value={v} />
                ))}
                <input type="hidden" name="confirm_email" value={value} />
                <button
                  type="submit"
                  disabled={!isMatch || isPending}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                >
                  {isPending ? "..." : buttonText}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
