-- CRM capability layer on profiles (employee + optional sales). No new app_role for sales.

DO $$ BEGIN
  CREATE TYPE public.crm_access_scope AS ENUM ('none', 'assigned', 'org');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS crm_access_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS crm_access_scope public.crm_access_scope NOT NULL DEFAULT 'none';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_crm_access_consistent;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_crm_access_consistent CHECK (
    (crm_access_enabled = false AND crm_access_scope = 'none')
    OR (crm_access_enabled = true AND crm_access_scope IN ('assigned', 'org'))
  );

CREATE INDEX IF NOT EXISTS profiles_crm_access_idx ON public.profiles (crm_access_enabled, crm_access_scope)
  WHERE crm_access_enabled = true;

-- Full CRM in /admin/leads: super_admin | admin only (matches is_staff / plan)
CREATE OR REPLACE FUNCTION public.is_crm_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.has_active_employee_portal(p_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hr_employees e
    WHERE e.user_id = p_uid
      AND e.portal_status = 'active'
  );
$$;

-- Employee-path CRM (/employee/leads): not client, not global admins, active HR portal, flag on
CREATE OR REPLACE FUNCTION public.can_use_employee_crm(p_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = p_uid
      AND p.role <> 'client'
      AND p.role NOT IN ('super_admin', 'admin')
      AND p.crm_access_enabled = true
      AND p.crm_access_scope IN ('assigned', 'org')
      AND public.has_active_employee_portal(p_uid)
  );
$$;

-- Same "org" for broader lead visibility: same HR department or shared HR team
CREATE OR REPLACE FUNCTION public.crm_lead_same_org(p_viewer uuid, p_assignee uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p_viewer IS NOT DISTINCT FROM p_assignee
    OR (
      EXISTS (
        SELECT 1
        FROM public.hr_employees ev
        JOIN public.hr_employees ea ON ea.user_id = p_assignee AND ea.user_id IS NOT NULL
        WHERE ev.user_id = p_viewer
          AND ev.department_id IS NOT NULL
          AND ev.department_id = ea.department_id
      )
    )
    OR (
      EXISTS (
        SELECT 1
        FROM public.hr_team_members tmv
        JOIN public.hr_team_members tma ON tma.team_id = tmv.team_id
        JOIN public.hr_employees ev ON ev.id = tmv.employee_id
        JOIN public.hr_employees ea ON ea.id = tma.employee_id
        WHERE ev.user_id = p_viewer
          AND ea.user_id = p_assignee
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.profiles_prevent_self_crm_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.id = auth.uid() THEN
    IF NOT public.is_staff() THEN
      IF NEW.crm_access_enabled IS DISTINCT FROM OLD.crm_access_enabled
         OR NEW.crm_access_scope IS DISTINCT FROM OLD.crm_access_scope THEN
        RAISE EXCEPTION 'CRM access cannot be changed on your own profile';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_self_crm_escalation_trg ON public.profiles;
CREATE TRIGGER profiles_prevent_self_crm_escalation_trg
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_prevent_self_crm_escalation();

CREATE OR REPLACE FUNCTION public.profiles_enforce_client_no_crm()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'client' THEN
    NEW.crm_access_enabled := false;
    NEW.crm_access_scope := 'none';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_enforce_client_no_crm_trg ON public.profiles;
CREATE TRIGGER profiles_enforce_client_no_crm_trg
  BEFORE INSERT OR UPDATE OF role, crm_access_enabled, crm_access_scope ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_enforce_client_no_crm();

GRANT EXECUTE ON FUNCTION public.is_crm_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_employee_portal(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_use_employee_crm(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_lead_same_org(uuid, uuid) TO authenticated;
