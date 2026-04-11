export type CrmLeadRow = {
  id: string;
  title: string;
  company_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  stage: string;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  source_type: string | null;
  source_page: string | null;
  source_form: string | null;
  locale: string | null;
  request_type: string | null;
  service_category: string | null;
  sector: string | null;
  message: string | null;
  internal_notes: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  status: string;
  priority: string;
  follow_up_at: string | null;
  last_contact_at: string | null;
  won_at: string | null;
  lost_at: string | null;
  lost_reason: string | null;
  metadata: Record<string, unknown> | null;
};

export type CrmLeadNoteRow = {
  id: string;
  lead_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type CrmLeadActivityRow = {
  id: string;
  lead_id: string;
  author_id: string;
  kind: string;
  body: string;
  created_at: string;
};

export type CrmLeadStageEventRow = {
  id: string;
  lead_id: string;
  from_stage: string | null;
  to_stage: string;
  actor_id: string | null;
  created_at: string;
};

/** Kanban / pipeline order */
export const CRM_STAGES = [
  "new",
  "contacted",
  "qualified",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
  "archived",
] as const;
export type CrmStage = (typeof CRM_STAGES)[number];

/** Legacy + current stage values accepted in DB */
export const CRM_STAGE_SET = new Set<string>([
  ...CRM_STAGES,
  "proposal", // legacy
]);
