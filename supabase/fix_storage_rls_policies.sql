-- Fix RLS policies for pdf_storage bucket to allow authenticated users
-- Drop existing policies first
DROP POLICY IF EXISTS "pdf_storage_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "pdf_storage_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "pdf_storage_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "pdf_storage_delete_policy" ON storage.objects;

-- Create more permissive policies for authenticated users
CREATE POLICY "pdf_storage_authenticated_select" ON storage.objects
FOR SELECT USING (
  bucket_id = 'pdf_storage' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "pdf_storage_authenticated_insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pdf_storage' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "pdf_storage_authenticated_update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'pdf_storage' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "pdf_storage_authenticated_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pdf_storage' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

-- Alternative: If the above doesn't work, try this more permissive approach
-- Uncomment the lines below if the above policies still don't work

/*
-- Very permissive policies for development
CREATE POLICY "pdf_storage_public_select" ON storage.objects
FOR SELECT USING (bucket_id = 'pdf_storage');

CREATE POLICY "pdf_storage_public_insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'pdf_storage');

CREATE POLICY "pdf_storage_public_update" ON storage.objects
FOR UPDATE USING (bucket_id = 'pdf_storage');

CREATE POLICY "pdf_storage_public_delete" ON storage.objects
FOR DELETE USING (bucket_id = 'pdf_storage');
*/
