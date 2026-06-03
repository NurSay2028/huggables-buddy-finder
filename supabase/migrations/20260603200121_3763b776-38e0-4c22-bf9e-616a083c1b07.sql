-- 1) Tighten landing bucket write policies to require landing-management permission
DROP POLICY IF EXISTS "landing clinic upload" ON storage.objects;
DROP POLICY IF EXISTS "landing clinic update" ON storage.objects;
DROP POLICY IF EXISTS "landing clinic delete" ON storage.objects;

CREATE POLICY "landing clinic upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'landing'
    AND (
      is_super_admin(auth.uid())
      OR (
        can_manage_landing(auth.uid())
        AND array_length(storage.foldername(name), 1) >= 1
        AND belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
      )
    )
  );

CREATE POLICY "landing clinic update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'landing'
    AND (
      is_super_admin(auth.uid())
      OR (
        can_manage_landing(auth.uid())
        AND array_length(storage.foldername(name), 1) >= 1
        AND belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
      )
    )
  )
  WITH CHECK (
    bucket_id = 'landing'
    AND (
      is_super_admin(auth.uid())
      OR (
        can_manage_landing(auth.uid())
        AND array_length(storage.foldername(name), 1) >= 1
        AND belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
      )
    )
  );

CREATE POLICY "landing clinic delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'landing'
    AND (
      is_super_admin(auth.uid())
      OR (
        can_manage_landing(auth.uid())
        AND array_length(storage.foldername(name), 1) >= 1
        AND belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
      )
    )
  );

-- 2) Remove broad public listing on public buckets.
-- Public objects are still served via the public object endpoint (RLS-bypassing),
-- so images keep loading; this only blocks enumerating/listing bucket contents.
DROP POLICY IF EXISTS "landing public read" ON storage.objects;
DROP POLICY IF EXISTS "logos public read" ON storage.objects;

-- 3) Revoke EXECUTE on SECURITY DEFINER helper functions from anon/public.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.belongs_to_clinic(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.can_manage_landing(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_clinic_member(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.user_clinic_id(uuid) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.belongs_to_clinic(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_landing(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_clinic_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_clinic_id(uuid) TO authenticated;