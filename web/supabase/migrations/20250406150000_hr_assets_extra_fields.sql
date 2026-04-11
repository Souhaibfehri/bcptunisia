-- Extra asset registry fields (plan: condition, warranty, purchase date).

ALTER TABLE public.hr_assets
  ADD COLUMN IF NOT EXISTS physical_condition text;
ALTER TABLE public.hr_assets
  ADD COLUMN IF NOT EXISTS warranty_expires date;
ALTER TABLE public.hr_assets
  ADD COLUMN IF NOT EXISTS purchase_date date;
