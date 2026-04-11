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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 border-b border-bcp-border pb-4">
        <h2 className="text-lg font-semibold text-bcp-anthracite">Ressources humaines</h2>
        <nav className="flex flex-wrap gap-2 text-sm">
          <Link href="/admin/hr" className="rounded-full px-3 py-1 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite">
            Tableau de bord
          </Link>
          <Link href="/admin/hr/employees" className="rounded-full px-3 py-1 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite">
            Effectifs
          </Link>
          <Link href="/admin/hr/leave" className="rounded-full px-3 py-1 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite">
            Congés
          </Link>
          <Link href="/admin/hr/leave/calendar" className="rounded-full px-3 py-1 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite">
            Calendrier
          </Link>
          <Link href="/admin/hr/documents" className="rounded-full px-3 py-1 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite">
            Documents
          </Link>
          <Link href="/admin/hr/payroll" className="rounded-full px-3 py-1 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite">
            Bulletins
          </Link>
          <Link href="/admin/hr/assets" className="rounded-full px-3 py-1 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite">
            Matériel
          </Link>
          <Link href="/admin/hr/teams" className="rounded-full px-3 py-1 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite">
            Équipes
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
