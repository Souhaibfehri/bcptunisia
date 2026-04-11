-- Optional columns for user management: invite tracking + soft-disable
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS invited_at  timestamptz,
  ADD COLUMN IF NOT EXISTS disabled_at timestamptz;
