-- =========================================================================
-- Security hardening migration
-- =========================================================================

-- 1) ai_appointment_requests: stop cross-clinic exposure of leads -----------
-- Auto-assign incoming public leads to the single clinic so clinic-scoped
-- policies can apply. (Public booking form cannot know the clinic.)
CREATE OR REPLACE FUNCTION public.assign_request_clinic()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.clinic_id IS NULL THEN
    SELECT id INTO NEW.clinic_id FROM public.clinics ORDER BY created_at LIMIT 1;
  END IF;
  RETURN NEW;
END $$;

REVOKE EXECUTE ON FUNCTION public.assign_request_clinic() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_assign_request_clinic ON public.ai_appointment_requests;
CREATE TRIGGER trg_assign_request_clinic
BEFORE INSERT ON public.ai_appointment_requests
FOR EACH ROW EXECUTE FUNCTION public.assign_request_clinic();

-- Backfill existing unassigned leads to the single clinic.
UPDATE public.ai_appointment_requests
SET clinic_id = (SELECT id FROM public.clinics ORDER BY created_at LIMIT 1)
WHERE clinic_id IS NULL;

-- Replace overly-permissive (USING true) policies with clinic-scoped ones.
DROP POLICY IF EXISTS "auth manage requests select" ON public.ai_appointment_requests;
DROP POLICY IF EXISTS "auth manage requests update" ON public.ai_appointment_requests;
DROP POLICY IF EXISTS "auth manage requests delete" ON public.ai_appointment_requests;

CREATE POLICY "requests tenant select"
ON public.ai_appointment_requests
FOR SELECT TO authenticated
USING (belongs_to_clinic(auth.uid(), clinic_id) OR is_super_admin(auth.uid()));

CREATE POLICY "requests tenant update"
ON public.ai_appointment_requests
FOR UPDATE TO authenticated
USING (belongs_to_clinic(auth.uid(), clinic_id) OR is_super_admin(auth.uid()))
WITH CHECK (belongs_to_clinic(auth.uid(), clinic_id) OR is_super_admin(auth.uid()));

CREATE POLICY "requests tenant delete"
ON public.ai_appointment_requests
FOR DELETE TO authenticated
USING (belongs_to_clinic(auth.uid(), clinic_id) OR is_super_admin(auth.uid()));

-- 2) landing_content: restrict writes to clinic managers --------------------
DROP POLICY IF EXISTS "landing auth insert" ON public.landing_content;
DROP POLICY IF EXISTS "landing auth update" ON public.landing_content;

CREATE POLICY "landing manager insert"
ON public.landing_content
FOR INSERT TO authenticated
WITH CHECK (
  is_super_admin(auth.uid())
  OR has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "landing manager update"
ON public.landing_content
FOR UPDATE TO authenticated
USING (
  is_super_admin(auth.uid())
  OR has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  is_super_admin(auth.uid())
  OR has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 3) storage: 'landing' bucket — restrict writes to clinic managers ---------
DROP POLICY IF EXISTS "landing auth upload" ON storage.objects;
DROP POLICY IF EXISTS "landing auth update" ON storage.objects;
DROP POLICY IF EXISTS "landing auth delete" ON storage.objects;
DROP POLICY IF EXISTS "landing public read" ON storage.objects;

CREATE POLICY "landing manager upload"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'landing'
  AND (
    is_super_admin(auth.uid())
    OR has_role(auth.uid(), 'owner'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "landing manager update"
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'landing'
  AND (
    is_super_admin(auth.uid())
    OR has_role(auth.uid(), 'owner'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "landing manager delete"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'landing'
  AND (
    is_super_admin(auth.uid())
    OR has_role(auth.uid(), 'owner'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- 4) storage: 'logos' bucket — restrict writes to the owning clinic ---------
-- Files are stored under '<clinic_id>/...' so we scope by the path prefix.
DROP POLICY IF EXISTS "logos auth upload" ON storage.objects;
DROP POLICY IF EXISTS "logos auth update" ON storage.objects;
DROP POLICY IF EXISTS "logos auth delete" ON storage.objects;
DROP POLICY IF EXISTS "logos public read" ON storage.objects;

CREATE POLICY "logos clinic upload"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'logos'
  AND (
    is_super_admin(auth.uid())
    OR belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
  )
);

CREATE POLICY "logos clinic update"
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'logos'
  AND (
    is_super_admin(auth.uid())
    OR belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
  )
);

CREATE POLICY "logos clinic delete"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'logos'
  AND (
    is_super_admin(auth.uid())
    OR belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
  )
);

-- 5) Lock down trigger-only SECURITY DEFINER functions from API callers -----
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- RLS helper functions: required by policies for authenticated users, but
-- anon never needs them — tighten their reach.
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.belongs_to_clinic(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.belongs_to_clinic(uuid, uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.user_clinic_id(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_clinic_id(uuid) TO authenticated, service_role;