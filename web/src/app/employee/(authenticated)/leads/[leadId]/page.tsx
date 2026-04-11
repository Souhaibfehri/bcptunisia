import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CrmLeadDetailView } from "@/components/crm/CrmLeadDetailView";
import { buildProfileNameMap } from "@/lib/crm/nameMap";
import type {
  CrmLeadActivityRow,
  CrmLeadNoteRow,
  CrmLeadRow,
  CrmLeadStageEventRow,
} from "@/lib/crm/types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ leadId: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function EmployeeLeadDetailPage({ params, searchParams }: PageProps) {
  const { leadId } = await params;
  const sp = await searchParams;

  const supabase = await createServerSupabaseClient();
  const { data: leadRaw } = await supabase.from("crm_leads").select("*").eq("id", leadId).single();
  if (!leadRaw) notFound();
  const lead = leadRaw as CrmLeadRow;

  const { data: notesRaw } = await supabase
    .from("crm_lead_notes")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  const { data: activitiesRaw } = await supabase
    .from("crm_lead_activities")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  const { data: stageEvRaw } = await supabase
    .from("crm_lead_stage_events")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  const notes = (notesRaw ?? []) as CrmLeadNoteRow[];
  const activities = (activitiesRaw ?? []) as CrmLeadActivityRow[];
  const stageEvents = (stageEvRaw ?? []) as CrmLeadStageEventRow[];

  const ids = [
    lead.created_by,
    lead.assigned_to,
    ...notes.map((n) => n.author_id),
    ...activities.map((a) => a.author_id),
    ...stageEvents.map((s) => s.actor_id).filter(Boolean),
  ] as string[];
  const nameByUserId = await buildProfileNameMap(supabase, ids);

  const flashError = sp.error ? decodeURIComponent(sp.error) : undefined;

  return (
    <CrmLeadDetailView
      basePath="/employee/leads"
      isAdminCrm={false}
      lead={lead}
      notes={notes}
      activities={activities}
      stageEvents={stageEvents}
      nameByUserId={nameByUserId}
      flashError={flashError}
      flashSuccess={sp.success}
    />
  );
}
