-- Teams + extended leave manager scope (line manager or team manager).

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'people_manager';

CREATE TABLE IF NOT EXISTS public.hr_teams (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hr_team_members (
  team_id     uuid NOT NULL REFERENCES public.hr_teams (id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.hr_employees (id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'manager')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, employee_id)
);

CREATE INDEX IF NOT EXISTS hr_team_members_employee_idx ON public.hr_team_members (employee_id);
CREATE INDEX IF NOT EXISTS hr_team_members_team_idx ON public.hr_team_members (team_id);

DROP TRIGGER IF EXISTS hr_teams_updated ON public.hr_teams;
CREATE TRIGGER hr_teams_updated
  BEFORE UPDATE ON public.hr_teams
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Line manager OR team manager (same team, role manager on that team)
CREATE OR REPLACE FUNCTION public.is_employee_manager_of_employee(p_employee uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.hr_employees e
      WHERE e.id = p_employee
        AND e.manager_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.hr_team_members tm_member
      JOIN public.hr_team_members tm_mgr
        ON tm_mgr.team_id = tm_member.team_id
       AND tm_mgr.role = 'manager'
      JOIN public.hr_employees mgr ON mgr.id = tm_mgr.employee_id
      WHERE tm_member.employee_id = p_employee
        AND mgr.user_id = auth.uid()
    );
$$;

ALTER TABLE public.hr_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hr_teams_hr_all"
  ON public.hr_teams FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_teams_manager_select"
  ON public.hr_teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hr_team_members tm
      JOIN public.hr_employees e ON e.id = tm.employee_id
      WHERE tm.team_id = hr_teams.id
        AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "hr_team_members_hr_all"
  ON public.hr_team_members FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_team_members_self_select"
  ON public.hr_team_members FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );
