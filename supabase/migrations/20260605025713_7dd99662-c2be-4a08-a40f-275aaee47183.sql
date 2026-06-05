
CREATE POLICY "Authenticated can read content bucket"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'content');

CREATE POLICY "Admins can insert into content bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'content' AND private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update content bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'content' AND private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete from content bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'content' AND private.has_role(auth.uid(), 'admin'::app_role));
