"use client";

import { useTransition } from "react";
import { getPayslipSignedUrl } from "@/lib/hr/payslip-download";

export function PayslipDownloadButton({ payslipId, label = "Télécharger" }: { payslipId: string; label?: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const res = await getPayslipSignedUrl(payslipId);
          if (res.url) window.open(res.url, "_blank", "noopener,noreferrer");
          else if (res.error) alert(res.error);
        });
      }}
      className="text-xs font-semibold text-bcp-navy hover:underline disabled:opacity-50"
    >
      {pending ? "…" : label}
    </button>
  );
}
