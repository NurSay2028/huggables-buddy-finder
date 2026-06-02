-- ========== ENUMS ==========
CREATE TYPE public.app_role AS ENUM ('super_admin', 'owner', 'admin', 'doctor', 'reception', 'warehouse', 'accountant');
CREATE TYPE public.clinic_status AS ENUM ('pending', 'approved', 'blocked', 'suspended');
CREATE TYPE public.subscription_plan AS ENUM ('trial', 'starter', 'pro', 'enterprise');
CREATE TYPE public.appointment_status AS ENUM ('waiting', 'in_treatment', 'completed', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'click', 'payme', 'bank_transfer');
CREATE TYPE public.tooth_procedure AS ENUM ('healthy', 'filling', 'root_canal', 'crown', 'implant', 'extraction', 'whitening', 'braces', 'missing');
CREATE TYPE public.ai_request_status AS ENUM ('new','called','booked','rejected');

-- ========== HELPER: touch updated_at ==========
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;

-- ========== CLINICS ==========
CREATE TABLE public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  doctors_count INT NOT NULL DEFAULT 1,
  status public.clinic_status NOT NULL DEFAULT 'approved',
  subscription_plan public.subscription_plan NOT NULL DEFAULT 'pro',
  logo_url TEXT,
  working_hours JSONB DEFAULT '{"start":"09:00","end":"19:00"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== PROFILES ==========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== USER ROLES ==========
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, clinic_id, role)
);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_clinic ON public.user_roles(clinic_id);

-- ========== SECURITY DEFINER HELPERS ==========
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.user_clinic_id(_user_id UUID)
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT clinic_id FROM public.user_roles WHERE user_id = _user_id AND clinic_id IS NOT NULL LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.belongs_to_clinic(_user_id UUID, _clinic_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND clinic_id = _clinic_id);
$$;

-- ========== TENANT TABLES ==========
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  birth_date DATE,
  gender TEXT,
  address TEXT,
  allergies TEXT,
  medical_conditions TEXT,
  notes TEXT,
  debt NUMERIC NOT NULL DEFAULT 0,
  last_visit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, phone)
);
CREATE INDEX idx_patients_clinic ON public.patients(clinic_id);

CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  specialty TEXT,
  phone TEXT,
  salary_percentage NUMERIC NOT NULL DEFAULT 30,
  schedule JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_doctors_clinic ON public.doctors(clinic_id);

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  service_type TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  status public.appointment_status NOT NULL DEFAULT 'waiting',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_appointments_clinic_date ON public.appointments(clinic_id, starts_at);

CREATE TABLE public.dental_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  tooth_number INT NOT NULL,
  procedure public.tooth_procedure NOT NULL,
  notes TEXT,
  before_image_url TEXT,
  after_image_url TEXT,
  cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_dental_records_patient ON public.dental_records(patient_id);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  method public.payment_method NOT NULL,
  description TEXT,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_clinic ON public.payments(clinic_id);

CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'pcs',
  expiration_date DATE,
  purchase_price NUMERIC DEFAULT 0,
  supplier TEXT,
  low_stock_threshold NUMERIC DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_inventory_clinic ON public.inventory(clinic_id);

-- ========== ONLINE BOOKING REQUESTS ==========
CREATE TABLE public.ai_appointment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  problem text,
  preferred_date date,
  preferred_time text,
  conversation jsonb DEFAULT '[]'::jsonb,
  status public.ai_request_status NOT NULL DEFAULT 'new',
  clinic_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER tr_ai_req_updated BEFORE UPDATE ON public.ai_appointment_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ========== LANDING CONTENT (single editable row) ==========
CREATE TABLE public.landing_content (
  id INT PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT landing_content_single CHECK (id = 1)
);
CREATE TRIGGER tr_landing_updated BEFORE UPDATE ON public.landing_content
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
INSERT INTO public.landing_content (id, content) VALUES (1, '{}'::jsonb);

-- ========== GRANTS ==========
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinics TO authenticated;
GRANT ALL ON public.clinics TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctors TO authenticated;
GRANT ALL ON public.doctors TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dental_records TO authenticated;
GRANT ALL ON public.dental_records TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory TO authenticated;
GRANT ALL ON public.inventory TO service_role;
GRANT INSERT ON public.ai_appointment_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_appointment_requests TO authenticated;
GRANT ALL ON public.ai_appointment_requests TO service_role;
GRANT SELECT ON public.landing_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.landing_content TO authenticated;
GRANT ALL ON public.landing_content TO service_role;

-- ========== ENABLE RLS ==========
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dental_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_appointment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;

-- ========== POLICIES ==========
CREATE POLICY "profiles self select" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_super_admin(auth.uid()));
CREATE POLICY "profiles self upsert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "roles self select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));
CREATE POLICY "roles super admin write" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "clinics member select" ON public.clinics FOR SELECT TO authenticated
  USING (public.belongs_to_clinic(auth.uid(), id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "clinics super admin update" ON public.clinics FOR UPDATE TO authenticated
  USING (public.is_super_admin(auth.uid()));
CREATE POLICY "clinics owner update settings" ON public.clinics FOR UPDATE TO authenticated
  USING (public.belongs_to_clinic(auth.uid(), id) AND public.has_role(auth.uid(), 'owner'));

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['patients','doctors','appointments','dental_records','payments','inventory'])
  LOOP
    EXECUTE format('CREATE POLICY "%I tenant select" ON public.%I FOR SELECT TO authenticated USING (public.belongs_to_clinic(auth.uid(), clinic_id) OR public.is_super_admin(auth.uid()))', t, t);
    EXECUTE format('CREATE POLICY "%I tenant insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.belongs_to_clinic(auth.uid(), clinic_id))', t, t);
    EXECUTE format('CREATE POLICY "%I tenant update" ON public.%I FOR UPDATE TO authenticated USING (public.belongs_to_clinic(auth.uid(), clinic_id))', t, t);
    EXECUTE format('CREATE POLICY "%I tenant delete" ON public.%I FOR DELETE TO authenticated USING (public.belongs_to_clinic(auth.uid(), clinic_id))', t, t);
  END LOOP;
END $$;

-- booking requests: anyone may submit, clinic staff manage all
CREATE POLICY "anon can submit request" ON public.ai_appointment_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new'::ai_request_status AND char_length(full_name) BETWEEN 1 AND 200 AND char_length(phone) BETWEEN 3 AND 40);
CREATE POLICY "auth manage requests select" ON public.ai_appointment_requests
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth manage requests update" ON public.ai_appointment_requests
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth manage requests delete" ON public.ai_appointment_requests
  FOR DELETE TO authenticated USING (true);

-- landing content: public read, staff edits
CREATE POLICY "landing public read" ON public.landing_content
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "landing auth update" ON public.landing_content
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "landing auth insert" ON public.landing_content
  FOR INSERT TO authenticated WITH CHECK (true);

-- ========== AUTO PROFILE TRIGGER ==========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== LOCK DOWN HELPERS ==========
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.belongs_to_clinic(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.user_clinic_id(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ========== STORAGE BUCKETS ==========
INSERT INTO storage.buckets (id, name, public) VALUES ('logos','logos',true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('landing','landing',true) ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "logos public read" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "logos auth upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');
CREATE POLICY "logos auth update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'logos');
CREATE POLICY "logos auth delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'logos');

CREATE POLICY "landing public read" ON storage.objects FOR SELECT USING (bucket_id = 'landing');
CREATE POLICY "landing auth upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'landing');
CREATE POLICY "landing auth update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'landing');
CREATE POLICY "landing auth delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'landing');