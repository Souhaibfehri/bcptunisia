-- Leads / CRM tables + RLS (staff full; employee CRM scoped)

CREATE TABLE IF NOT EXISTS public.crm_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  stage text NOT NULL DEFAULT 'new',
  assigned_to uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crm_leads_assigned_idx ON public.crm_leads (assigned_to);
CREATE INDEX IF NOT EXISTS crm_leads_created_by_idx ON public.crm_leads (created_by);
CREATE INDEX IF NOT EXISTS crm_leads_stage_idx ON public.crm_leads (stage);

CREATE TABLE IF NOT EXISTS public.crm_lead_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.crm_leads (id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crm_lead_notes_lead_idx ON public.crm_lead_notes (lead_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.crm_lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.crm_leads (id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'note',
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crm_lead_activities_lead_idx ON public.crm_lead_activities (lead_id, created_at DESC);

DROP TRIGGER IF EXISTS crm_leads_updated ON public.crm_leads;
CREATE TRIGGER crm_leads_updated
  BEFORE UPDATE ON public.crm_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.can_read_crm_lead(p_lead uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assignee uuid;
  v_scope public.crm_access_scope;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;
  IF public.is_crm_staff() THEN
    RETURN true;
  END IF;

  SELECT l.assigned_to INTO assignee FROM public.crm_leads l WHERE l.id = p_lead;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF NOT public.can_use_employee_crm(v_uid) THEN
    RETURN false;
  END IF;

  SELECT p.crm_access_scope INTO v_scope FROM public.profiles p WHERE p.id = v_uid;

  IF assignee IS NOT DISTINCT FROM v_uid THEN
    RETURN true;
  END IF;

  IF v_scope = 'assigned' THEN
    RETURN false;
  END IF;

  IF v_scope = 'org' THEN
    IF assignee IS NULL THEN
      RETURN true;
    END IF;
    RETURN public.crm_lead_same_org(v_uid, assignee);
  END IF;

  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_write_crm_lead(p_lead uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_crm_staff() OR public.can_read_crm_lead(p_lead);
$$;

ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_lead_activities ENABLE ROW LEVEL SECURITY;

-- crm_leads
CREATE POLICY "crm_leads_staff_all"
  ON public.crm_leads FOR ALL
  USING (public.is_crm_staff())
  WITH CHECK (public.is_crm_staff());

CREATE POLICY "crm_leads_employee_select"
  ON public.crm_leads FOR SELECT
  USING (public.can_read_crm_lead(id));

CREATE POLICY "crm_leads_employee_insert"
  ON public.crm_leads FOR INSERT
  WITH CHECK (
    public.can_use_employee_crm(auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "crm_leads_employee_update"
  ON public.crm_leads FOR UPDATE
  USING (public.can_write_crm_lead(id))
  WITH CHECK (public.can_write_crm_lead(id));

-- crm_lead_notes
CREATE POLICY "crm_lead_notes_staff_all"
  ON public.crm_lead_notes FOR ALL
  USING (public.is_crm_staff())
  WITH CHECK (public.is_crm_staff());

CREATE POLICY "crm_lead_notes_employee_select"
  ON public.crm_lead_notes FOR SELECT
  USING (public.can_read_crm_lead(lead_id));

CREATE POLICY "crm_lead_notes_employee_insert"
  ON public.crm_lead_notes FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND public.can_write_crm_lead(lead_id)
  );

CREATE POLICY "crm_lead_notes_employee_update"
  ON public.crm_lead_notes FOR UPDATE
  USING (
    public.can_read_crm_lead(lead_id)
    AND (author_id = auth.uid() OR public.is_crm_staff())
  )
  WITH CHECK (
    public.can_read_crm_lead(lead_id)
    AND (author_id = auth.uid() OR public.is_crm_staff())
  );

CREATE POLICY "crm_lead_notes_employee_delete"
  ON public.crm_lead_notes FOR DELETE
  USING (author_id = auth.uid() OR public.is_crm_staff());

-- crm_lead_activities
CREATE POLICY "crm_lead_activities_staff_all"
  ON public.crm_lead_activities FOR ALL
  USING (public.is_crm_staff())
  WITH CHECK (public.is_crm_staff());

CREATE POLICY "crm_lead_activities_employee_select"
  ON public.crm_lead_activities FOR SELECT
  USING (public.can_read_crm_lead(lead_id));

CREATE POLICY "crm_lead_activities_employee_insert"
  ON public.crm_lead_activities FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND public.can_write_crm_lead(lead_id)
  );

CREATE POLICY "crm_lead_activities_employee_update"
  ON public.crm_lead_activities FOR UPDATE
  USING (
    public.can_read_crm_lead(lead_id)
    AND (author_id = auth.uid() OR public.is_crm_staff())
  )
  WITH CHECK (
    public.can_read_crm_lead(lead_id)
    AND (author_id = auth.uid() OR public.is_crm_staff())
  );

CREATE POLICY "crm_lead_activities_employee_delete"
  ON public.crm_lead_activities FOR DELETE
  USING (author_id = auth.uid() OR public.is_crm_staff());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_lead_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_lead_activities TO authenticated;

GRANT EXECUTE ON FUNCTION public.can_read_crm_lead(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_write_crm_lead(uuid) TO authenticated;
