DROP POLICY IF EXISTS "landing public read" ON storage.objects;
DROP POLICY IF EXISTS "logos public read" ON storage.objects;

CREATE POLICY "landing public read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'landing');

CREATE POLICY "logos public read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'logos');