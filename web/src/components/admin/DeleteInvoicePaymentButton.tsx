"use client";

import { useState } from "react";
import { deleteInvoicePayment } from "@/app/admin/actions";

type Props = {
  projectId: string;
  invoiceId: string;
  paymentId: string;
};

export function DeleteInvoicePaymentButton({ projectId, invoiceId, paymentId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[0.6rem] text-red-400 hover:text-red-600"
      >
        Supprimer
      </button>
      {open && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="max-w-sm rounded-xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-medium text-bcp-anthracite">Supprimer ce paiement ?</p>
            <p className="mt-2 text-xs text-bcp-muted">Le montant total payé sur la facture sera recalculé.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-bcp-border px-3 py-1.5 text-xs font-medium text-bcp-muted hover:bg-bcp-surface"
              >
                Annuler
              </button>
              <form action={deleteInvoicePayment}>
                <input type="hidden" name="project_id" value={projectId} />
                <input type="hidden" name="invoice_id" value={invoiceId} />
                <input type="hidden" name="payment_id" value={paymentId} />
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Supprimer
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
