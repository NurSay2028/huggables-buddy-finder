-- ============ Patient Telegram fields ============
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS telegram_code text,
  ADD COLUMN IF NOT EXISTS telegram_chat_id bigint;

CREATE UNIQUE INDEX IF NOT EXISTS patients_telegram_code_key
  ON public.patients (telegram_code) WHERE telegram_code IS NOT NULL;

-- Random 6-char code generator (no ambiguous chars)
CREATE OR REPLACE FUNCTION public.gen_patient_telegram_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  i int;
  n int;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random()*length(chars))::int + 1, 1);
    END LOOP;
    SELECT count(*) INTO n FROM public.patients WHERE telegram_code = code;
    EXIT WHEN n = 0;
  END LOOP;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_patient_telegram_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.telegram_code IS NULL THEN
    NEW.telegram_code := public.gen_patient_telegram_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_patient_telegram_code ON public.patients;
CREATE TRIGGER trg_assign_patient_telegram_code
BEFORE INSERT ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.assign_patient_telegram_code();

-- Backfill existing patients
UPDATE public.patients
SET telegram_code = public.gen_patient_telegram_code()
WHERE telegram_code IS NULL;

-- ============ Reminder templates ============
CREATE TABLE public.reminder_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  name text NOT NULL,
  body text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_templates TO authenticated;
GRANT ALL ON public.reminder_templates TO service_role;

ALTER TABLE public.reminder_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates tenant select" ON public.reminder_templates
  FOR SELECT TO authenticated
  USING (belongs_to_clinic(auth.uid(), clinic_id) OR is_super_admin(auth.uid()));
CREATE POLICY "templates tenant insert" ON public.reminder_templates
  FOR INSERT TO authenticated
  WITH CHECK (belongs_to_clinic(auth.uid(), clinic_id));
CREATE POLICY "templates tenant update" ON public.reminder_templates
  FOR UPDATE TO authenticated
  USING (belongs_to_clinic(auth.uid(), clinic_id))
  WITH CHECK (belongs_to_clinic(auth.uid(), clinic_id));
CREATE POLICY "templates tenant delete" ON public.reminder_templates
  FOR DELETE TO authenticated
  USING (belongs_to_clinic(auth.uid(), clinic_id));

CREATE TRIGGER trg_reminder_templates_updated_at
BEFORE UPDATE ON public.reminder_templates
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed a default template per existing clinic
INSERT INTO public.reminder_templates (clinic_id, name, body, is_default)
SELECT id,
  'Standart eslatma',
  'Assalomu alaykum {name}! Eslatma: {date} kuni soat {time} da {treatment} bo''yicha qabulingiz bor. Iltimos o''z vaqtida tashrif buyuring.',
  true
FROM public.clinics;