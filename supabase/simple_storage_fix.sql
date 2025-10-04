-- Simple fix for pdf_storage bucket RLS issues
-- Run this in Supabase SQL Editor

-- 1. Ensure bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdf_storage',
  'pdf_storage', 
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'image/bmp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop all existing policies for storage.objects
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON storage.objects';
    END LOOP;
END $$;

-- 3. Create simple, permissive policies
CREATE POLICY "pdf_storage_all_access" ON storage.objects
FOR ALL USING (bucket_id = 'pdf_storage');

-- 4. Verify the bucket is accessible
SELECT * FROM storage.buckets WHERE id = 'pdf_storage';
