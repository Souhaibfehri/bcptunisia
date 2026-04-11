-- New rows must get a primary key without the app sending `id` (NOT NULL, no default after PK migration).
ALTER TABLE public.hr_employees
  ALTER COLUMN id SET DEFAULT gen_random_uuid();
