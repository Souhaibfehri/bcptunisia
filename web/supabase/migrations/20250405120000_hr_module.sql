-- BCP Tunisia — HR / Employee Management module (additive)
--
-- Phase 0 note: public.is_staff() = super_admin | admin ONLY (not project_manager).
-- App layer grants project_manager /admin via JWT; PM relies on member SELECT policies + server actions.
-- HR uses NEW helpers is_super_admin() / is_hr_staff() so PM never inherits HR or sensitive payroll rows.

-- ── Role enum ─────────────────────────────────────────────────────────────
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hr_admin';

-- ── SQL helpers ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_hr_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'hr_admin')
  );
$$;

-- ── Enums (HR-specific) ───────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.hr_employment_status AS ENUM (
    'active', 'on_leave', 'probation', 'suspended', 'terminated'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.hr_employment_type AS ENUM (
    'employee', 'contractor', 'intern'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.hr_leave_request_status AS ENUM (
    'pending', 'approved', 'rejected', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.hr_asset_registry_status AS ENUM (
    'available', 'assigned', 'retired', 'lost'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Departments ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hr_departments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  parent_id   uuid REFERENCES public.hr_departments (id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hr_departments_parent_idx ON public.hr_departments (parent_id);

-- ── Core employee row (1:1 profiles for internal people) ───────────────────
CREATE TABLE IF NOT EXISTS public.hr_employees (
  user_id           uuid PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  employee_number   text UNIQUE,
  employment_status public.hr_employment_status NOT NULL DEFAULT 'active',
  employment_type   public.hr_employment_type NOT NULL DEFAULT 'employee',
  contract_type     text,
  job_title         text,
  department_id     uuid REFERENCES public.hr_departments (id) ON DELETE SET NULL,
  manager_user_id   uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  hire_date         date,
  end_date          date,
  work_email        text,
  work_phone        text,
  office_location   text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hr_employees_department_idx ON public.hr_employees (department_id);
CREATE INDEX IF NOT EXISTS hr_employees_manager_idx ON public.hr_employees (manager_user_id);
CREATE INDEX IF NOT EXISTS hr_employees_status_idx ON public.hr_employees (employment_status);

CREATE OR REPLACE FUNCTION public.is_employee_manager_of(p_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hr_employees e
    WHERE e.user_id = p_user
      AND e.manager_user_id = auth.uid()
  );
$$;

-- ── Sensitive HR (salary, notes) — separate RLS ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.hr_employee_sensitive (
  user_id             uuid PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  annual_salary_cents bigint,
  currency            text NOT NULL DEFAULT 'TND',
  pay_frequency       text,
  bank_iban           text,
  hr_private_notes    text,
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ── Leave ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hr_leave_types (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE,
  label       text NOT NULL,
  paid        boolean NOT NULL DEFAULT true,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hr_leave_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  leave_type_id   uuid NOT NULL REFERENCES public.hr_leave_types (id) ON DELETE RESTRICT,
  starts_on       date NOT NULL,
  ends_on         date NOT NULL,
  status          public.hr_leave_request_status NOT NULL DEFAULT 'pending',
  reason          text,
  decided_by      uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  decided_at      timestamptz,
  decision_note   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hr_leave_dates_ok CHECK (ends_on >= starts_on)
);

CREATE INDEX IF NOT EXISTS hr_leave_requests_user_idx ON public.hr_leave_requests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS hr_leave_requests_status_idx ON public.hr_leave_requests (status);

-- ── Assets ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hr_assets (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  category       text,
  serial_number  text,
  status         public.hr_asset_registry_status NOT NULL DEFAULT 'available',
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hr_asset_assignments (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id             uuid NOT NULL REFERENCES public.hr_assets (id) ON DELETE CASCADE,
  user_id              uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  assigned_at          timestamptz NOT NULL DEFAULT now(),
  expected_return_on   date,
  returned_at          timestamptz,
  condition_out        text,
  condition_in         text,
  notes                text
);

CREATE INDEX IF NOT EXISTS hr_asset_assignments_user_idx ON public.hr_asset_assignments (user_id);
CREATE INDEX IF NOT EXISTS hr_asset_assignments_asset_idx ON public.hr_asset_assignments (asset_id);

-- ── Employee documents & payslips ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hr_employee_documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  category      text,
  filename      text NOT NULL,
  storage_path  text NOT NULL,
  uploaded_by   uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hr_employee_documents_user_idx ON public.hr_employee_documents (user_id);

CREATE TABLE IF NOT EXISTS public.hr_payslips (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  period_start  date NOT NULL,
  period_end    date NOT NULL,
  filename      text NOT NULL,
  storage_path  text NOT NULL,
  uploaded_by   uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hr_payslip_period_ok CHECK (period_end >= period_start)
);

CREATE INDEX IF NOT EXISTS hr_payslips_user_idx ON public.hr_payslips (user_id, period_start DESC);

-- ── Attendance foundations ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hr_work_schedules (
  user_id        uuid PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  weekly_hours   numeric(5,2),
  notes          text,
  effective_from date,
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hr_attendance_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  day        date NOT NULL,
  check_in   timestamptz,
  check_out  timestamptz,
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hr_attendance_events_user_day_idx ON public.hr_attendance_events (user_id, day DESC);

-- ── updated_at triggers ─────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS hr_departments_updated ON public.hr_departments;
CREATE TRIGGER hr_departments_updated
  BEFORE UPDATE ON public.hr_departments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS hr_employees_updated ON public.hr_employees;
CREATE TRIGGER hr_employees_updated
  BEFORE UPDATE ON public.hr_employees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS hr_leave_requests_updated ON public.hr_leave_requests;
CREATE TRIGGER hr_leave_requests_updated
  BEFORE UPDATE ON public.hr_leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS hr_assets_updated ON public.hr_assets;
CREATE TRIGGER hr_assets_updated
  BEFORE UPDATE ON public.hr_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS hr_employee_sensitive_updated ON public.hr_employee_sensitive;
CREATE TRIGGER hr_employee_sensitive_updated
  BEFORE UPDATE ON public.hr_employee_sensitive
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Seed leave types ────────────────────────────────────────────────────────
INSERT INTO public.hr_leave_types (code, label, paid, sort_order)
VALUES
  ('annual', 'Congé annuel', true, 0),
  ('sick', 'Congé maladie', true, 1),
  ('unpaid', 'Sans solde', false, 2),
  ('other', 'Autre', true, 3)
ON CONFLICT (code) DO NOTHING;

-- ── RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE public.hr_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employee_sensitive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_attendance_events ENABLE ROW LEVEL SECURITY;

-- hr_departments
CREATE POLICY "hr_departments_hr_all"
  ON public.hr_departments FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_departments_employee_select"
  ON public.hr_departments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.user_id = auth.uid())
  );

-- hr_employees
CREATE POLICY "hr_employees_self_select"
  ON public.hr_employees FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "hr_employees_hr_all"
  ON public.hr_employees FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

-- hr_employee_sensitive: HR only (super_admin + hr_admin)
CREATE POLICY "hr_sensitive_hr_all"
  ON public.hr_employee_sensitive FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

-- hr_leave_types: readable by anyone with an employee record or HR
CREATE POLICY "hr_leave_types_select"
  ON public.hr_leave_types FOR SELECT
  USING (
    public.is_hr_staff()
    OR EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.user_id = auth.uid())
  );

CREATE POLICY "hr_leave_types_hr_write"
  ON public.hr_leave_types FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

-- hr_leave_requests
CREATE POLICY "hr_leave_self_select"
  ON public.hr_leave_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "hr_leave_manager_select"
  ON public.hr_leave_requests FOR SELECT
  USING (public.is_employee_manager_of(user_id));

CREATE POLICY "hr_leave_hr_all"
  ON public.hr_leave_requests FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_leave_self_insert"
  ON public.hr_leave_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "hr_leave_self_update_cancel"
  ON public.hr_leave_requests FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "hr_leave_manager_update"
  ON public.hr_leave_requests FOR UPDATE
  USING (
    public.is_employee_manager_of(user_id)
    AND status = 'pending'
  )
  WITH CHECK (public.is_employee_manager_of(user_id));

-- hr_assets (registry): HR full access; assignees can read assets they hold
CREATE POLICY "hr_assets_hr_all"
  ON public.hr_assets FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_assets_assignee_select"
  ON public.hr_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hr_asset_assignments a
      WHERE a.asset_id = hr_assets.id
        AND a.user_id = auth.uid()
        AND a.returned_at IS NULL
    )
  );

-- hr_asset_assignments
CREATE POLICY "hr_asset_assign_self_select"
  ON public.hr_asset_assignments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "hr_asset_assign_hr_all"
  ON public.hr_asset_assignments FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

-- Documents & payslips
CREATE POLICY "hr_docs_self_select"
  ON public.hr_employee_documents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "hr_docs_hr_all"
  ON public.hr_employee_documents FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_payslips_self_select"
  ON public.hr_payslips FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "hr_payslips_hr_all"
  ON public.hr_payslips FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

-- Work schedule / attendance
CREATE POLICY "hr_schedule_self_select"
  ON public.hr_work_schedules FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "hr_schedule_hr_all"
  ON public.hr_work_schedules FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_attendance_self_select"
  ON public.hr_attendance_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "hr_attendance_self_insert"
  ON public.hr_attendance_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "hr_attendance_hr_all"
  ON public.hr_attendance_events FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

-- ── profiles: HR staff can read all profiles (directory) ───────────────────
CREATE POLICY "profiles_select_hr_staff"
  ON public.profiles FOR SELECT
  USING (public.is_hr_staff());

-- ── Project data: HR staff read-only (for employee–project linkage UI) ─────
CREATE POLICY "projects_hr_staff_select"
  ON public.projects FOR SELECT
  USING (public.is_hr_staff());

CREATE POLICY "project_members_hr_staff_select"
  ON public.project_members FOR SELECT
  USING (public.is_hr_staff());

CREATE POLICY "project_stages_hr_staff_select"
  ON public.project_stages FOR SELECT
  USING (public.is_hr_staff());

CREATE POLICY "project_tasks_hr_staff_select"
  ON public.project_tasks FOR SELECT
  USING (public.is_hr_staff());

CREATE POLICY "project_subtasks_hr_staff_select"
  ON public.project_subtasks FOR SELECT
  USING (public.is_hr_staff());

-- ── Storage: hr-private bucket ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('hr-private', 'hr-private', false)
ON CONFLICT (id) DO NOTHING;

-- HR staff full access to hr-private
CREATE POLICY "storage_hr_private_hr_all"
  ON storage.objects FOR ALL
  USING (bucket_id = 'hr-private' AND public.is_hr_staff())
  WITH CHECK (bucket_id = 'hr-private' AND public.is_hr_staff());

-- Employees read only objects under their user_id prefix
CREATE POLICY "storage_hr_private_own_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'hr-private'
    AND auth.uid() IS NOT NULL
    AND (
      name LIKE auth.uid()::text || '/%'
      OR name LIKE auth.uid()::text || '\\%'
    )
  );
