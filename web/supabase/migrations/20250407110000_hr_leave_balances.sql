-- Leave balance ledger + optional cached balance per employee / type / year

CREATE TABLE IF NOT EXISTS public.hr_leave_balance_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.hr_employees (id) ON DELETE CASCADE,
  leave_type_id uuid NOT NULL REFERENCES public.hr_leave_types (id) ON DELETE RESTRICT,
  year smallint NOT NULL CHECK (year >= 2000 AND year <= 2100),
  delta_days numeric(10, 2) NOT NULL,
  reference_type text NOT NULL CHECK (reference_type IN ('manual', 'leave_request', 'opening', 'carry_over')),
  reference_id uuid,
  note text,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS hr_leave_balance_movement_leave_req_unique
  ON public.hr_leave_balance_movements (reference_id)
  WHERE reference_type = 'leave_request' AND reference_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS hr_leave_balance_movements_emp_idx
  ON public.hr_leave_balance_movements (employee_id, year DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS public.hr_leave_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.hr_employees (id) ON DELETE CASCADE,
  leave_type_id uuid NOT NULL REFERENCES public.hr_leave_types (id) ON DELETE RESTRICT,
  year smallint NOT NULL CHECK (year >= 2000 AND year <= 2100),
  balance_days numeric(10, 2) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, leave_type_id, year)
);

CREATE INDEX IF NOT EXISTS hr_leave_balances_emp_idx ON public.hr_leave_balances (employee_id, year DESC);

ALTER TABLE public.hr_leave_balance_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_leave_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hr_leave_movements_hr_all"
  ON public.hr_leave_balance_movements FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_leave_movements_self_select"
  ON public.hr_leave_balance_movements FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );

CREATE POLICY "hr_leave_balances_hr_all"
  ON public.hr_leave_balances FOR ALL
  USING (public.is_hr_staff())
  WITH CHECK (public.is_hr_staff());

CREATE POLICY "hr_leave_balances_self_select"
  ON public.hr_leave_balances FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );
