-- 1) Helper to validate a clinic exists (bypasses RLS safely for anon submissions)
CREATE OR REPLACE FUNCTION public.clinic_exists(_clinic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.clinics WHERE id = _clinic_id);
$$;

REVOKE EXECUTE ON FUNCTION public.clinic_exists(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.clinic_exists(uuid) TO anon, authenticated, service_role;

-- 2) Require a valid clinic_id on anonymous appointment request submissions
DROP POLICY IF EXISTS "anon can submit request" ON public.ai_appointment_requests;

CREATE POLICY "anon can submit request"
ON public.ai_appointment_requests
FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'new'::ai_request_status
  AND char_length(full_name) BETWEEN 1 AND 200
  AND char_length(phone) BETWEEN 3 AND 40
  AND clinic_id IS NOT NULL
  AND public.clinic_exists(clinic_id)
);

-- 3) Restrict SECURITY DEFINER helper from anonymous execution
REVOKE EXECUTE ON FUNCTION public.shares_clinic(uuid, uuid) FROM PUBLIC, anon;

-- 4) Drop the unused, unscoped single-argument has_role overload to prevent misuse
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
