DROP POLICY IF EXISTS "landing manager upload" ON storage.objects;
DROP POLICY IF EXISTS "landing manager update" ON storage.objects;
DROP POLICY IF EXISTS "landing manager delete" ON storage.objects;
DROP POLICY IF EXISTS "landing member upload" ON storage.objects;
DROP POLICY IF EXISTS "landing member update" ON storage.objects;
DROP POLICY IF EXISTS "landing member delete" ON storage.objects;

CREATE POLICY "landing clinic upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'landing'
  AND (
    public.is_super_admin(auth.uid())
    OR (
      array_length(storage.foldername(name), 1) >= 1
      AND public.belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
  )
);

CREATE POLICY "landing clinic update" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'landing'
  AND (
    public.is_super_admin(auth.uid())
    OR (
      array_length(storage.foldername(name), 1) >= 1
      AND public.belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
  )
)
WITH CHECK (
  bucket_id = 'landing'
  AND (
    public.is_super_admin(auth.uid())
    OR (
      array_length(storage.foldername(name), 1) >= 1
      AND public.belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
  )
);

CREATE POLICY "landing clinic delete" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'landing'
  AND (
    public.is_super_admin(auth.uid())
    OR (
      array_length(storage.foldername(name), 1) >= 1
      AND public.belongs_to_clinic(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
  )
);