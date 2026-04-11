-- Public lead capture fields + workflow + stage history (additive; created_by nullable for website leads)

ALTER TABLE public.crm_leads
  ALTER COLUMN created_by DROP NOT NULL;

-- Normalize legacy stage label from app
UPDATE public.crm_leads SET stage = 'proposal_sent' WHERE stage = 'proposal';

ALTER TABLE public.crm_leads
  ADD COLUMN IF NOT EXISTS source_type text,
  ADD COLUMN IF NOT EXISTS source_page text,
  ADD COLUMN IF NOT EXISTS source_form text,
  ADD COLUMN IF NOT EXISTS locale text,
  ADD COLUMN IF NOT EXISTS request_type text,
  ADD COLUMN IF NOT EXISTS service_category text,
  ADD COLUMN IF NOT EXISTS sector text,
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS follow_up_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_contact_at timestamptz,
  ADD COLUMN IF NOT EXISTS won_at timestamptz,
  ADD COLUMN IF NOT EXISTS lost_at timestamptz,
  ADD COLUMN IF NOT EXISTS lost_reason text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.crm_leads DROP CONSTRAINT IF EXISTS crm_leads_stage_check;
ALTER TABLE public.crm_leads ADD CONSTRAINT crm_leads_stage_check CHECK (
  stage IN (
    'new', 'contacted', 'qualified', 'proposal', 'proposal_sent',
    'negotiation', 'won', 'lost', 'archived'
  )
);

ALTER TABLE public.crm_leads DROP CONSTRAINT IF EXISTS crm_leads_status_check;
ALTER TABLE public.crm_leads ADD CONSTRAINT crm_leads_status_check CHECK (status IN ('open', 'archived'));

ALTER TABLE public.crm_leads DROP CONSTRAINT IF EXISTS crm_leads_priority_check;
ALTER TABLE public.crm_leads ADD CONSTRAINT crm_leads_priority_check CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

CREATE INDEX IF NOT EXISTS crm_leads_follow_up_idx ON public.crm_leads (follow_up_at) WHERE follow_up_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS crm_leads_status_idx ON public.crm_leads (status);
CREATE INDEX IF NOT EXISTS crm_leads_created_at_idx ON public.crm_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS crm_leads_contact_email_idx ON public.crm_leads (lower(contact_email));

-- Stage change audit trail
CREATE TABLE IF NOT EXISTS public.crm_lead_stage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.crm_leads (id) ON DELETE CASCADE,
  from_stage text,
  to_stage text NOT NULL,
  actor_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crm_lead_stage_events_lead_idx ON public.crm_lead_stage_events (lead_id, created_at DESC);

ALTER TABLE public.crm_lead_stage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_lead_stage_events_staff_all"
  ON public.crm_lead_stage_events FOR ALL
  USING (public.is_crm_staff())
  WITH CHECK (public.is_crm_staff());

CREATE POLICY "crm_lead_stage_events_employee_select"
  ON public.crm_lead_stage_events FOR SELECT
  USING (public.can_read_crm_lead(lead_id));

CREATE POLICY "crm_lead_stage_events_employee_insert"
  ON public.crm_lead_stage_events FOR INSERT
  WITH CHECK (
    public.can_write_crm_lead(lead_id)
    AND (actor_id = auth.uid() OR public.is_crm_staff())
  );

GRANT SELECT, INSERT ON public.crm_lead_stage_events TO authenticated;
