-- Keep landing page storage uploads available to signed-in clinic members.
-- Public content is still controlled through landing_content policies, while storage
-- writes remain authenticated-only.
DROP POLICY IF EXISTS "landing manager upload" ON storage.objects;
DROP POLICY IF EXISTS "landing manager update" ON storage.objects;
DROP POLICY IF EXISTS "landing manager delete" ON storage.objects;
DROP POLICY IF EXISTS "landing member upload" ON storage.objects;
DROP POLICY IF EXISTS "landing member update" ON storage.objects;
DROP POLICY IF EXISTS "landing member delete" ON storage.objects;

CREATE POLICY "landing member upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'landing'
  AND public.is_clinic_member(auth.uid())
);

CREATE POLICY "landing member update" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'landing'
  AND public.is_clinic_member(auth.uid())
)
WITH CHECK (
  bucket_id = 'landing'
  AND public.is_clinic_member(auth.uid())
);

CREATE POLICY "landing member delete" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'landing'
  AND public.is_clinic_member(auth.uid())
);

-- Make logo uploads robust while preserving clinic-folder ownership checks.
DROP POLICY IF EXISTS "logos clinic upload" ON storage.objects;
DROP POLICY IF EXISTS "logos clinic update" ON storage.objects;
DROP POLICY IF EXISTS "logos clinic delete" ON storage.objects;
DROP POLICY IF EXISTS "logos member upload" ON storage.objects;
DROP POLICY IF EXISTS "logos member update" ON storage.objects;
DROP POLICY IF EXISTS "logos member delete" ON storage.objects;

CREATE POLICY "logos clinic upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'logos'
  AND (
    public.is_super_admin(auth.uid())
    OR (
      array_length(storage.foldername(name), 1) >= 1
      AND public.belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
  )
);

CREATE POLICY "logos clinic update" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'logos'
  AND (
    public.is_super_admin(auth.uid())
    OR (
      array_length(storage.foldername(name), 1) >= 1
      AND public.belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
  )
)
WITH CHECK (
  bucket_id = 'logos'
  AND (
    public.is_super_admin(auth.uid())
    OR (
      array_length(storage.foldername(name), 1) >= 1
      AND public.belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
  )
);

CREATE POLICY "logos clinic delete" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'logos'
  AND (
    public.is_super_admin(auth.uid())
    OR (
      array_length(storage.foldername(name), 1) >= 1
      AND public.belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
  )
);