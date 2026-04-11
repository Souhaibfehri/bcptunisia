-- HR: stable employee PK (id), nullable user_id link to profiles; child tables use employee_id.

-- ── Drop dependent RLS policies ────────────────────────────────────────────
DROP POLICY IF EXISTS "hr_departments_hr_all" ON public.hr_departments;
DROP POLICY IF EXISTS "hr_departments_employee_select" ON public.hr_departments;
DROP POLICY IF EXISTS "hr_employees_self_select" ON public.hr_employees;
DROP POLICY IF EXISTS "hr_employees_hr_all" ON public.hr_employees;
DROP POLICY IF EXISTS "hr_sensitive_hr_all" ON public.hr_employee_sensitive;
DROP POLICY IF EXISTS "hr_leave_types_select" ON public.hr_leave_types;
DROP POLICY IF EXISTS "hr_leave_types_hr_write" ON public.hr_leave_types;
DROP POLICY IF EXISTS "hr_leave_self_select" ON public.hr_leave_requests;
DROP POLICY IF EXISTS "hr_leave_manager_select" ON public.hr_leave_requests;
DROP POLICY IF EXISTS "hr_leave_hr_all" ON public.hr_leave_requests;
DROP POLICY IF EXISTS "hr_leave_self_insert" ON public.hr_leave_requests;
DROP POLICY IF EXISTS "hr_leave_self_update_cancel" ON public.hr_leave_requests;
DROP POLICY IF EXISTS "hr_leave_manager_update" ON public.hr_leave_requests;
DROP POLICY IF EXISTS "hr_assets_hr_all" ON public.hr_assets;
DROP POLICY IF EXISTS "hr_assets_assignee_select" ON public.hr_assets;
DROP POLICY IF EXISTS "hr_asset_assign_self_select" ON public.hr_asset_assignments;
DROP POLICY IF EXISTS "hr_asset_assign_hr_all" ON public.hr_asset_assignments;
DROP POLICY IF EXISTS "hr_docs_self_select" ON public.hr_employee_documents;
DROP POLICY IF EXISTS "hr_docs_hr_all" ON public.hr_employee_documents;
DROP POLICY IF EXISTS "hr_payslips_self_select" ON public.hr_payslips;
DROP POLICY IF EXISTS "hr_payslips_hr_all" ON public.hr_payslips;
DROP POLICY IF EXISTS "hr_schedule_self_select" ON public.hr_work_schedules;
DROP POLICY IF EXISTS "hr_schedule_hr_all" ON public.hr_work_schedules;
DROP POLICY IF EXISTS "hr_attendance_self_select" ON public.hr_attendance_events;
DROP POLICY IF EXISTS "hr_attendance_self_insert" ON public.hr_attendance_events;
DROP POLICY IF EXISTS "hr_attendance_hr_all" ON public.hr_attendance_events;

-- ── Manager helper on employee id ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_employee_manager_of_employee(p_employee uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hr_employees e
    WHERE e.id = p_employee
      AND e.manager_user_id = auth.uid()
  );
$$;

-- ── hr_employees: add id, swap PK, nullable user_id ────────────────────────
ALTER TABLE public.hr_employees ADD COLUMN IF NOT EXISTS id uuid;
UPDATE public.hr_employees SET id = user_id WHERE id IS NULL;
ALTER TABLE public.hr_employees ALTER COLUMN id SET NOT NULL;
ALTER TABLE public.hr_employees DROP CONSTRAINT hr_employees_pkey;
ALTER TABLE public.hr_employees ADD PRIMARY KEY (id);
ALTER TABLE public.hr_employees DROP CONSTRAINT hr_employees_user_id_fkey;
ALTER TABLE public.hr_employees ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.hr_employees
  ADD CONSTRAINT hr_employees_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles (id) ON DELETE SET NULL;
CREATE UNIQUE INDEX hr_employees_user_id_unique ON public.hr_employees (user_id) WHERE user_id IS NOT NULL;

-- ── hr_employee_sensitive ─────────────────────────────────────────────────
ALTER TABLE public.hr_employee_sensitive ADD COLUMN IF NOT EXISTS employee_id uuid;
UPDATE public.hr_employee_sensitive s
SET employee_id = e.id
FROM public.hr_employees e
WHERE e.user_id = s.user_id;
ALTER TABLE public.hr_employee_sensitive ALTER COLUMN employee_id SET NOT NULL;
ALTER TABLE public.hr_employee_sensitive DROP CONSTRAINT hr_employee_sensitive_pkey;
ALTER TABLE public.hr_employee_sensitive DROP CONSTRAINT hr_employee_sensitive_user_id_fkey;
ALTER TABLE public.hr_employee_sensitive DROP COLUMN user_id;
ALTER TABLE public.hr_employee_sensitive ADD PRIMARY KEY (employee_id);
ALTER TABLE public.hr_employee_sensitive
  ADD CONSTRAINT hr_employee_sensitive_employee_fkey
  FOREIGN KEY (employee_id) REFERENCES public.hr_employees (id) ON DELETE CASCADE;

-- ── hr_leave_requests ─────────────────────────────────────────────────────
ALTER TABLE public.hr_leave_requests ADD COLUMN IF NOT EXISTS employee_id uuid;
UPDATE public.hr_leave_requests r
SET employee_id = e.id
FROM public.hr_employees e
WHERE e.user_id = r.user_id;
ALTER TABLE public.hr_leave_requests ALTER COLUMN employee_id SET NOT NULL;
DROP INDEX IF EXISTS hr_leave_requests_user_idx;
ALTER TABLE public.hr_leave_requests DROP CONSTRAINT hr_leave_requests_user_id_fkey;
ALTER TABLE public.hr_leave_requests DROP COLUMN user_id;
ALTER TABLE public.hr_leave_requests
  ADD CONSTRAINT hr_leave_requests_employee_fkey
  FOREIGN KEY (employee_id) REFERENCES public.hr_employees (id) ON DELETE CASCADE;
CREATE INDEX hr_leave_requests_employee_idx ON public.hr_leave_requests (employee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS hr_leave_requests_status_idx ON public.hr_leave_requests (status);

-- ── hr_asset_assignments ───────────────────────────────────────────────────
ALTER TABLE public.hr_asset_assignments ADD COLUMN IF NOT EXISTS employee_id uuid;
UPDATE public.hr_asset_assignments a
SET employee_id = e.id
FROM public.hr_employees e
WHERE e.user_id = a.user_id;
ALTER TABLE public.hr_asset_assignments ALTER COLUMN employee_id SET NOT NULL;
DROP INDEX IF EXISTS hr_asset_assignments_user_idx;
ALTER TABLE public.hr_asset_assignments DROP CONSTRAINT hr_asset_assignments_user_id_fkey;
ALTER TABLE public.hr_asset_assignments DROP COLUMN user_id;
ALTER TABLE public.hr_asset_assignments
  ADD CONSTRAINT hr_asset_assignments_employee_fkey
  FOREIGN KEY (employee_id) REFERENCES public.hr_employees (id) ON DELETE CASCADE;
CREATE INDEX hr_asset_assignments_employee_idx ON public.hr_asset_assignments (employee_id);

-- ── hr_employee_documents ───────────────────────────────────────────────────
ALTER TABLE public.hr_employee_documents ADD COLUMN IF NOT EXISTS employee_id uuid;
UPDATE public.hr_employee_documents d
SET employee_id = e.id
FROM public.hr_employees e
WHERE e.user_id = d.user_id;
ALTER TABLE public.hr_employee_documents ALTER COLUMN employee_id SET NOT NULL;
DROP INDEX IF EXISTS hr_employee_documents_user_idx;
ALTER TABLE public.hr_employee_documents DROP CONSTRAINT hr_employee_documents_user_id_fkey;
ALTER TABLE public.hr_employee_documents DROP COLUMN user_id;
ALTER TABLE public.hr_employee_documents
  ADD CONSTRAINT hr_employee_documents_employee_fkey
  FOREIGN KEY (employee_id) REFERENCES public.hr_employees (id) ON DELETE CASCADE;
CREATE INDEX hr_employee_documents_employee_idx ON public.hr_employee_documents (employee_id);

-- ── hr_payslips ─────────────────────────────────────────────────────────────
ALTER TABLE public.hr_payslips ADD COLUMN IF NOT EXISTS employee_id uuid;
UPDATE public.hr_payslips p
SET employee_id = e.id
FROM public.hr_employees e
WHERE e.user_id = p.user_id;
ALTER TABLE public.hr_payslips ALTER COLUMN employee_id SET NOT NULL;
DROP INDEX IF EXISTS hr_payslips_user_idx;
ALTER TABLE public.hr_payslips DROP CONSTRAINT hr_payslips_user_id_fkey;
ALTER TABLE public.hr_payslips DROP COLUMN user_id;
ALTER TABLE public.hr_payslips
  ADD CONSTRAINT hr_payslips_employee_fkey
  FOREIGN KEY (employee_id) REFERENCES public.hr_employees (id) ON DELETE CASCADE;
CREATE INDEX hr_payslips_employee_idx ON public.hr_payslips (employee_id, period_start DESC);

-- ── hr_work_schedules ───────────────────────────────────────────────────────
ALTER TABLE public.hr_work_schedules ADD COLUMN IF NOT EXISTS employee_id uuid;
UPDATE public.hr_work_schedules w
SET employee_id = e.id
FROM public.hr_employees e
WHERE e.user_id = w.user_id;
ALTER TABLE public.hr_work_schedules ALTER COLUMN employee_id SET NOT NULL;
ALTER TABLE public.hr_work_schedules DROP CONSTRAINT hr_work_schedules_pkey;
ALTER TABLE public.hr_work_schedules DROP CONSTRAINT hr_work_schedules_user_id_fkey;
ALTER TABLE public.hr_work_schedules DROP COLUMN user_id;
ALTER TABLE public.hr_work_schedules ADD PRIMARY KEY (employee_id);
ALTER TABLE public.hr_work_schedules
  ADD CONSTRAINT hr_work_schedules_employee_fkey
  FOREIGN KEY (employee_id) REFERENCES public.hr_employees (id) ON DELETE CASCADE;

-- ── hr_attendance_events ───────────────────────────────────────────────────
ALTER TABLE public.hr_attendance_events ADD COLUMN IF NOT EXISTS employee_id uuid;
UPDATE public.hr_attendance_events ev
SET employee_id = e.id
FROM public.hr_employees e
WHERE e.user_id = ev.user_id;
ALTER TABLE public.hr_attendance_events ALTER COLUMN employee_id SET NOT NULL;
DROP INDEX IF EXISTS hr_attendance_events_user_day_idx;
ALTER TABLE public.hr_attendance_events DROP CONSTRAINT hr_attendance_events_user_id_fkey;
ALTER TABLE public.hr_attendance_events DROP COLUMN user_id;
ALTER TABLE public.hr_attendance_events
  ADD CONSTRAINT hr_attendance_events_employee_fkey
  FOREIGN KEY (employee_id) REFERENCES public.hr_employees (id) ON DELETE CASCADE;
CREATE INDEX hr_attendance_events_employee_day_idx ON public.hr_attendance_events (employee_id, day DESC);

-- ── RLS: recreate policies ──────────────────────────────────────────────────
CREATE POLICY "hr_departments_hr_all"
  ON public.hr_departments FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_departments_employee_select"
  ON public.hr_departments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.user_id = auth.uid())
  );

CREATE POLICY "hr_employees_self_select"
  ON public.hr_employees FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "hr_employees_hr_all"
  ON public.hr_employees FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_sensitive_hr_all"
  ON public.hr_employee_sensitive FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

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

CREATE POLICY "hr_leave_self_select"
  ON public.hr_leave_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );

CREATE POLICY "hr_leave_manager_select"
  ON public.hr_leave_requests FOR SELECT
  USING (public.is_employee_manager_of_employee(employee_id));

CREATE POLICY "hr_leave_hr_all"
  ON public.hr_leave_requests FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_leave_self_insert"
  ON public.hr_leave_requests FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );

CREATE POLICY "hr_leave_self_update_cancel"
  ON public.hr_leave_requests FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
    AND status = 'pending'
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );

CREATE POLICY "hr_leave_manager_update"
  ON public.hr_leave_requests FOR UPDATE
  USING (
    public.is_employee_manager_of_employee(employee_id)
    AND status = 'pending'
  )
  WITH CHECK (public.is_employee_manager_of_employee(employee_id));

CREATE POLICY "hr_assets_hr_all"
  ON public.hr_assets FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_assets_assignee_select"
  ON public.hr_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hr_asset_assignments a
      JOIN public.hr_employees e ON e.id = a.employee_id
      WHERE a.asset_id = hr_assets.id
        AND e.user_id = auth.uid()
        AND a.returned_at IS NULL
    )
  );

CREATE POLICY "hr_asset_assign_self_select"
  ON public.hr_asset_assignments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );

CREATE POLICY "hr_asset_assign_hr_all"
  ON public.hr_asset_assignments FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_docs_self_select"
  ON public.hr_employee_documents FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );

CREATE POLICY "hr_docs_hr_all"
  ON public.hr_employee_documents FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_payslips_self_select"
  ON public.hr_payslips FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );

CREATE POLICY "hr_payslips_hr_all"
  ON public.hr_payslips FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_schedule_self_select"
  ON public.hr_work_schedules FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );

CREATE POLICY "hr_schedule_hr_all"
  ON public.hr_work_schedules FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_attendance_self_select"
  ON public.hr_attendance_events FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );

CREATE POLICY "hr_attendance_self_insert"
  ON public.hr_attendance_events FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );

CREATE POLICY "hr_attendance_hr_all"
  ON public.hr_attendance_events FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());
