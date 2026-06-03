-- Landing bucket: restrict writes to users who can manage the landing page
DROP POLICY IF EXISTS "landing member upload" ON storage.objects;
DROP POLICY IF EXISTS "landing member update" ON storage.objects;
DROP POLICY IF EXISTS "landing member delete" ON storage.objects;

CREATE POLICY "landing manager upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'landing' AND public.can_manage_landing(auth.uid()));

CREATE POLICY "landing manager update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'landing' AND public.can_manage_landing(auth.uid()))
  WITH CHECK (bucket_id = 'landing' AND public.can_manage_landing(auth.uid()));

CREATE POLICY "landing manager delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'landing' AND public.can_manage_landing(auth.uid()));

-- Logos bucket: restrict writes to members of the owning clinic (path: {clinic_id}/...)
DROP POLICY IF EXISTS "logos member upload" ON storage.objects;
DROP POLICY IF EXISTS "logos member update" ON storage.objects;
DROP POLICY IF EXISTS "logos member delete" ON storage.objects;

CREATE POLICY "logos clinic upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'logos'
    AND (
      public.is_super_admin(auth.uid())
      OR public.belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
  );

CREATE POLICY "logos clinic update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'logos'
    AND (
      public.is_super_admin(auth.uid())
      OR public.belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
  )
  WITH CHECK (
    bucket_id = 'logos'
    AND (
      public.is_super_admin(auth.uid())
      OR public.belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
  );

CREATE POLICY "logos clinic delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'logos'
    AND (
      public.is_super_admin(auth.uid())
      OR public.belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
  );