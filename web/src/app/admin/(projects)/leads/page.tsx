import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile, canAccessAdminCrm } from "@/lib/supabase/auth";
import { buildProfileNameMap } from "@/lib/crm/nameMap";
import type { CrmLeadRow } from "@/lib/crm/types";
import type { CrmRecentActivityRow } from "@/lib/crm/queries";
import { AdminFlashBanner } from "@/components/admin/AdminFlashBanner";
import { CrmOverviewSections } from "@/components/crm/CrmOverviewSections";
import { CrmKanbanBoard } from "@/components/crm/CrmKanbanBoard";
import { CrmLeadsListView } from "@/components/crm/CrmLeadsListView";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ error?: string; success?: string; view?: string }>;
};

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const profile = await getProfile();
  if (!profile || !canAccessAdminCrm(profile.role)) {
    redirect("/admin");
  }

  const sp = await searchParams;
  const view = sp.view === "board" ? "board" : sp.view === "list" ? "list" : "overview";

  const supabase = await createServerSupabaseClient();
  const { data: leadsRaw } = await supabase
    .from("crm_leads")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(500);

  const leads = (leadsRaw ?? []) as CrmLeadRow[];

  let recentActivities: CrmRecentActivityRow[] = [];
  if (leads.length > 0) {
    const { data: actRaw } = await supabase
      .from("crm_lead_activities")
      .select("id, lead_id, kind, body, created_at, author_id")
      .in(
        "lead_id",
        leads.map((l) => l.id),
      )
      .order("created_at", { ascending: false })
      .limit(12);
    recentActivities = (actRaw ?? []) as CrmRecentActivityRow[];
  }

  const ids = [
    ...new Set([
      ...leads.flatMap((l) => [l.assigned_to, l.created_by].filter(Boolean) as string[]),
      ...recentActivities.map((a) => a.author_id).filter(Boolean),
    ]),
  ];
  const nameByUserId = await buildProfileNameMap(supabase, ids);

  const basePath = "/admin/leads" as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin" className="text-xs font-medium text-bcp-gold">
            ← Tableau de bord
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-bcp-anthracite">Leads & CRM</h1>
          <p className="mt-1 text-sm text-bcp-muted">Espace commercial — vue complète.</p>
        </div>
        <Link
          href="/admin/leads/new"
          className="rounded-lg bg-bcp-navy px-4 py-2 text-sm font-semibold text-white hover:bg-bcp-navy/90"
        >
          Nouveau lead
        </Link>
      </div>

      <AdminFlashBanner error={sp.error} success={sp.success} />

      <nav className="flex flex-wrap gap-1 border-b border-bcp-border pb-2 text-sm">
        {(
          [
            ["overview", "Vue d'ensemble"],
            ["board", "Pipeline (Kanban)"],
            ["list", "Liste"],
          ] as const
        ).map(([v, label]) => (
          <Link
            key={v}
            href={v === "overview" ? basePath : `${basePath}?view=${v}`}
            className={`rounded-t-lg px-4 py-2 font-medium ${
              view === v ? "bg-bcp-navy text-white" : "text-bcp-muted hover:bg-bcp-surface"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {view === "overview" ? (
        leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-bcp-border bg-bcp-surface/40 px-6 py-12 text-center">
            <p className="text-sm font-medium text-bcp-anthracite">Aucun lead pour l’instant</p>
            <p className="mt-2 text-sm text-bcp-muted">
              Les formulaires du site (accueil, contact, pages services) créent des leads automatiquement lorsque le
              serveur est configuré (clé service Supabase).
            </p>
            <Link href="/admin/leads/new" className="mt-4 inline-block text-sm font-semibold text-bcp-gold hover:underline">
              Créer un lead manuellement
            </Link>
          </div>
        ) : (
          <CrmOverviewSections
            leads={leads}
            nameByUserId={nameByUserId}
            basePath={basePath}
            recentActivities={recentActivities}
          />
        )
      ) : null}

      {view === "board" ? (
        <div className="rounded-2xl border border-bcp-border bg-bcp-surface/20 p-4">
          <CrmKanbanBoard leads={leads} nameByUserId={nameByUserId} basePath={basePath} />
        </div>
      ) : null}

      {view === "list" ? <CrmLeadsListView leads={leads} nameByUserId={nameByUserId} basePath={basePath} /> : null}
    </div>
  );
}
