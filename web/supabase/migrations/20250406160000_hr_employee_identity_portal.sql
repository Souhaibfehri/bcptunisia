-- HR employee identity fields, portal lifecycle, storage path support for employee_id prefix

DO $$ BEGIN
  CREATE TYPE public.hr_portal_status AS ENUM (
    'none',
    'invite_pending',
    'active',
    'disabled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.hr_employees
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS personal_email text,
  ADD COLUMN IF NOT EXISTS personal_phone text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS emergency_contact_name text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
  ADD COLUMN IF NOT EXISTS civp_eligible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS employee_notes text,
  ADD COLUMN IF NOT EXISTS portal_status public.hr_portal_status NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS portal_invited_at timestamptz,
  ADD COLUMN IF NOT EXISTS portal_linked_at timestamptz;

UPDATE public.hr_employees
SET portal_status = 'active'
WHERE user_id IS NOT NULL AND portal_status = 'none';

-- Employees read legacy paths (auth.uid()/...) and new paths employees/{employee_id}/...
DROP POLICY IF EXISTS "storage_hr_private_own_read" ON storage.objects;

CREATE POLICY "storage_hr_private_own_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'hr-private'
    AND auth.uid() IS NOT NULL
    AND (
      name LIKE (auth.uid()::text || '/%')
      OR name LIKE (auth.uid()::text || '\%')
      OR EXISTS (
        SELECT 1
        FROM public.hr_employees e
        WHERE e.user_id = auth.uid()
          AND e.portal_status = 'active'
          AND (
            name LIKE ('employees/' || e.id::text || '/%')
            OR name LIKE ('employees/' || e.id::text || '\%')
          )
      )
    )
  );
