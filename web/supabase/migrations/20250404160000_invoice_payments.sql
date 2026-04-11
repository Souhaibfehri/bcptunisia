-- BCP Tunisia — invoice payment history table

CREATE TABLE IF NOT EXISTS public.invoice_payments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id  uuid NOT NULL REFERENCES public.invoices (id) ON DELETE CASCADE,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  paid_on     date NOT NULL DEFAULT CURRENT_DATE,
  method      text,            -- virement, chèque, espèces, carte, etc.
  reference   text,            -- numéro de chèque, référence virement, etc.
  notes       text,
  recorded_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invoice_payments_invoice_idx
  ON public.invoice_payments (invoice_id, paid_on DESC);

-- RLS
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_payments_staff_all"
  ON public.invoice_payments FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "invoice_payments_member_select"
  ON public.invoice_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = invoice_id
        AND public.is_project_member(i.project_id)
    )
  );
