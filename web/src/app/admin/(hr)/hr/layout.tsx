import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile, canAccessHrAdmin } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AdminHrLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();
  if (!profile || !canAccessHrAdmin(profile.role)) {
    redirect("/admin");
  }

  const pill =
    "rounded-full px-3.5 py-1.5 text-sm font-medium text-bcp-anthracite/90 ring-1 ring-bcp-border/80 bg-white/90 shadow-sm transition hover:bg-gradient-to-r hover:from-bcp-gold/15 hover:to-amber-50/80 hover:ring-bcp-gold/40 hover:text-bcp-navy";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-bcp-border/80 bg-gradient-to-r from-bcp-navy/[0.06] via-white to-bcp-gold/[0.08] p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-bcp-navy">Ressources humaines</h2>
            <p className="mt-0.5 text-xs text-bcp-muted">Pilotage des équipes, congés et dossiers collaborateurs.</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            <Link href="/admin/hr" className={pill}>
              Tableau de bord
            </Link>
            <Link href="/admin/hr/employees" className={pill}>
              Effectifs
            </Link>
            <Link href="/admin/hr/leave" className={pill}>
              Congés
            </Link>
            <Link href="/admin/hr/leave/calendar" className={pill}>
              Calendrier
            </Link>
            <Link href="/admin/hr/documents" className={pill}>
              Documents
            </Link>
            <Link href="/admin/hr/payroll" className={pill}>
              Bulletins
            </Link>
            <Link href="/admin/hr/assets" className={pill}>
              Matériel
            </Link>
            <Link href="/admin/hr/teams" className={pill}>
              Équipes
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
