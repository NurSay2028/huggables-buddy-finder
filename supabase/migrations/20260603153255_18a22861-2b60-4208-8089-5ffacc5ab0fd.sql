-- Helper: can the user manage the global landing page?
-- Only super_admins or owner/admin of the PRIMARY (first-created) clinic.
CREATE OR REPLACE FUNCTION public.can_manage_landing(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_super_admin(_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = _user_id
        AND ur.role IN ('owner'::app_role, 'admin'::app_role)
        AND ur.clinic_id = (SELECT id FROM public.clinics ORDER BY created_at LIMIT 1)
    );
$$;

REVOKE EXECUTE ON FUNCTION public.can_manage_landing(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_landing(uuid) TO authenticated;

-- landing_content policies: replace permissive role-only check with clinic-scoped check
DROP POLICY IF EXISTS "landing manager insert" ON public.landing_content;
DROP POLICY IF EXISTS "landing manager update" ON public.landing_content;

CREATE POLICY "landing manager insert" ON public.landing_content
  FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_landing(auth.uid()));

CREATE POLICY "landing manager update" ON public.landing_content
  FOR UPDATE TO authenticated
  USING (public.can_manage_landing(auth.uid()))
  WITH CHECK (public.can_manage_landing(auth.uid()));

-- landing storage bucket policies: same clinic-scoped check
DROP POLICY IF EXISTS "landing manager upload" ON storage.objects;
DROP POLICY IF EXISTS "landing manager update" ON storage.objects;
DROP POLICY IF EXISTS "landing manager delete" ON storage.objects;

CREATE POLICY "landing manager upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'landing' AND public.can_manage_landing(auth.uid()));

CREATE POLICY "landing manager update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'landing' AND public.can_manage_landing(auth.uid()));

CREATE POLICY "landing manager delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'landing' AND public.can_manage_landing(auth.uid()));