-- Grant Data API access to all public tables (RLS still enforces row-level security)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_appointment_requests TO authenticated;
GRANT ALL ON public.ai_appointment_requests TO service_role;
GRANT SELECT, INSERT ON public.ai_appointment_requests TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinics TO authenticated;
GRANT ALL ON public.clinics TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dental_records TO authenticated;
GRANT ALL ON public.dental_records TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctors TO authenticated;
GRANT ALL ON public.doctors TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory TO authenticated;
GRANT ALL ON public.inventory TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.landing_content TO authenticated;
GRANT ALL ON public.landing_content TO service_role;
GRANT SELECT ON public.landing_content TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;