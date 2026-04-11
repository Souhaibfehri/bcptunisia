-- BCP Tunisia — invoice enrichment + project_manager system role

-- 1. Extend invoice_status enum with new values
ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'partially_paid';
ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'pending_validation';

-- 2. Add partial-payment tracking column
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS amount_paid_cents bigint NOT NULL DEFAULT 0;

-- 3. Add project_manager as a system-level role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'project_manager';
