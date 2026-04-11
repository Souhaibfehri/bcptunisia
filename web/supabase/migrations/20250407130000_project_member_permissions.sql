-- Fine-grained project permissions (invoices visibility first). Backfilled for non-regression.

CREATE TABLE IF NOT EXISTS public.project_member_permissions (
  project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  permissions jsonb NOT NULL DEFAULT '{"view_invoices": false, "view_budget": false}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS project_member_permissions_user_idx ON public.project_member_permissions (user_id);

INSERT INTO public.project_member_permissions (project_id, user_id, permissions)
SELECT m.project_id, m.user_id, '{"view_invoices": true, "view_budget": false}'::jsonb
FROM public.project_members m
ON CONFLICT (project_id, user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.ensure_project_member_permissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.project_member_permissions (project_id, user_id, permissions)
  VALUES (
    NEW.project_id,
    NEW.user_id,
    CASE
      WHEN NEW.role = 'observer' THEN '{"view_invoices": false, "view_budget": false}'::jsonb
      ELSE '{"view_invoices": true, "view_budget": false}'::jsonb
    END
  )
  ON CONFLICT (project_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS project_members_ensure_permissions ON public.project_members;
CREATE TRIGGER project_members_ensure_permissions
  AFTER INSERT ON public.project_members
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_project_member_permissions();

CREATE OR REPLACE FUNCTION public.project_member_can_view_invoices(p_project uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT (p.permissions ->> 'view_invoices')::boolean
      FROM public.project_member_permissions p
      WHERE p.project_id = p_project
        AND p.user_id = auth.uid()
    ),
    false
  );
$$;

ALTER TABLE public.project_member_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_member_permissions_staff_all"
  ON public.project_member_permissions FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "project_member_permissions_self_select"
  ON public.project_member_permissions FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "invoices_member_select" ON public.invoices;

CREATE POLICY "invoices_member_select"
  ON public.invoices FOR SELECT
  USING (
    public.is_project_member(project_id)
    AND public.project_member_can_view_invoices(project_id)
  );
