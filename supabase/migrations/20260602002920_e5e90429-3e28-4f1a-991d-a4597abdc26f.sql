DO $$ BEGIN
  CREATE TYPE public.treatment_type AS ENUM ('braces','implant','cleaning','filling','consultation','other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.reminder_status AS ENUM ('pending','contacted','completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS treatment_type public.treatment_type,
  ADD COLUMN IF NOT EXISTS next_visit_date date,
  ADD COLUMN IF NOT EXISTS reminder_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_note text,
  ADD COLUMN IF NOT EXISTS reminder_status public.reminder_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reminder_days_before integer NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_patients_next_visit
  ON public.patients (clinic_id, next_visit_date)
  WHERE reminder_enabled = true;