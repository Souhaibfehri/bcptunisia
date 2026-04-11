-- Separate internal CRM notes from the original public inquiry message
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS internal_notes text;
