-- ============ Helper: clinic member ============
CREATE OR REPLACE FUNCTION public.is_clinic_member(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin(_user_id)
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;
REVOKE EXECUTE ON FUNCTION public.is_clinic_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_clinic_member(uuid) TO authenticated;

-- ============ Storage: relax landing + logos to clinic members ============
DROP POLICY IF EXISTS "landing manager upload" ON storage.objects;
DROP POLICY IF EXISTS "landing manager update" ON storage.objects;
DROP POLICY IF EXISTS "landing manager delete" ON storage.objects;
DROP POLICY IF EXISTS "logos clinic upload" ON storage.objects;
DROP POLICY IF EXISTS "logos clinic update" ON storage.objects;
DROP POLICY IF EXISTS "logos clinic delete" ON storage.objects;

CREATE POLICY "landing member upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'landing' AND public.is_clinic_member(auth.uid()));
CREATE POLICY "landing member update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'landing' AND public.is_clinic_member(auth.uid()));
CREATE POLICY "landing member delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'landing' AND public.is_clinic_member(auth.uid()));

CREATE POLICY "logos member upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logos' AND public.is_clinic_member(auth.uid()));
CREATE POLICY "logos member update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'logos' AND public.is_clinic_member(auth.uid()));
CREATE POLICY "logos member delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'logos' AND public.is_clinic_member(auth.uid()));

-- ============ Expenses ============
CREATE TABLE public.expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'other',
  amount numeric NOT NULL DEFAULT 0,
  description text,
  spent_at date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic members read expenses" ON public.expenses FOR SELECT TO authenticated
  USING (public.belongs_to_clinic(auth.uid(), clinic_id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Clinic members insert expenses" ON public.expenses FOR INSERT TO authenticated
  WITH CHECK (public.belongs_to_clinic(auth.uid(), clinic_id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Clinic members update expenses" ON public.expenses FOR UPDATE TO authenticated
  USING (public.belongs_to_clinic(auth.uid(), clinic_id) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.belongs_to_clinic(auth.uid(), clinic_id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Clinic members delete expenses" ON public.expenses FOR DELETE TO authenticated
  USING (public.belongs_to_clinic(auth.uid(), clinic_id) OR public.is_super_admin(auth.uid()));

CREATE INDEX idx_expenses_clinic_spent ON public.expenses (clinic_id, spent_at);
CREATE TRIGGER trg_expenses_updated BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ Scheduled reminders ============
CREATE TABLE public.scheduled_reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  message text NOT NULL,
  send_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamptz,
  error text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_reminders TO authenticated;
GRANT ALL ON public.scheduled_reminders TO service_role;
ALTER TABLE public.scheduled_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic members read scheduled" ON public.scheduled_reminders FOR SELECT TO authenticated
  USING (public.belongs_to_clinic(auth.uid(), clinic_id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Clinic members insert scheduled" ON public.scheduled_reminders FOR INSERT TO authenticated
  WITH CHECK (public.belongs_to_clinic(auth.uid(), clinic_id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Clinic members update scheduled" ON public.scheduled_reminders FOR UPDATE TO authenticated
  USING (public.belongs_to_clinic(auth.uid(), clinic_id) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.belongs_to_clinic(auth.uid(), clinic_id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Clinic members delete scheduled" ON public.scheduled_reminders FOR DELETE TO authenticated
  USING (public.belongs_to_clinic(auth.uid(), clinic_id) OR public.is_super_admin(auth.uid()));

CREATE INDEX idx_scheduled_due ON public.scheduled_reminders (status, send_at);
CREATE TRIGGER trg_scheduled_updated BEFORE UPDATE ON public.scheduled_reminders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ Cron: process scheduled reminders every 5 minutes ============
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  PERFORM cron.unschedule('process-scheduled-reminders');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'process-scheduled-reminders',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--b76fdc16-6662-4231-aa76-ff14fdd8194e.lovable.app/api/public/hooks/process-scheduled',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);