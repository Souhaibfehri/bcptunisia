-- Extended fiche: document visibility, education & training tables, RLS.

ALTER TABLE public.hr_employee_documents
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'employee'
    CHECK (visibility IN ('employee', 'manager', 'hr_only'));
ALTER TABLE public.hr_employee_documents
  ADD COLUMN IF NOT EXISTS expires_on date;

DROP POLICY IF EXISTS "hr_docs_self_select" ON public.hr_employee_documents;
DROP POLICY IF EXISTS "hr_docs_manager_select" ON public.hr_employee_documents;
DROP POLICY IF EXISTS "hr_docs_hr_all" ON public.hr_employee_documents;

CREATE POLICY "hr_docs_self_select"
  ON public.hr_employee_documents FOR SELECT
  USING (
    visibility = 'employee'
    AND EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );

CREATE POLICY "hr_docs_manager_select"
  ON public.hr_employee_documents FOR SELECT
  USING (
    visibility = 'manager'
    AND public.is_employee_manager_of_employee(employee_id)
  );

CREATE POLICY "hr_docs_hr_all"
  ON public.hr_employee_documents FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE TABLE IF NOT EXISTS public.hr_employee_education (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  uuid NOT NULL REFERENCES public.hr_employees (id) ON DELETE CASCADE,
  institution  text,
  degree       text,
  field        text,
  ended_on     date,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hr_employee_education_employee_idx ON public.hr_employee_education (employee_id);

CREATE TABLE IF NOT EXISTS public.hr_training_records (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  uuid NOT NULL REFERENCES public.hr_employees (id) ON DELETE CASCADE,
  title        text NOT NULL,
  provider     text,
  completed_on date,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hr_training_records_employee_idx ON public.hr_training_records (employee_id);

ALTER TABLE public.hr_employee_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_training_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hr_education_self_select"
  ON public.hr_employee_education FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );

CREATE POLICY "hr_education_hr_all"
  ON public.hr_employee_education FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_training_self_select"
  ON public.hr_training_records FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );

CREATE POLICY "hr_training_hr_all"
  ON public.hr_training_records FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());
