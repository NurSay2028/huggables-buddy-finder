ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS doctor_id uuid,
  ADD COLUMN IF NOT EXISTS doctor_share numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clinic_share numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS doctor_percentage numeric NOT NULL DEFAULT 0;