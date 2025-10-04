-- Disable RLS temporarily for pdf_storage bucket (for development only)
-- WARNING: Only use this for development, not production!

-- First, make sure the bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdf_storage',
  'pdf_storage', 
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'image/bmp']
)
ON CONFLICT (id) DO NOTHING;

-- Disable RLS for storage.objects (temporary for development)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Alternative: If you can't disable RLS globally, create very permissive policies
-- Uncomment these if the above doesn't work:

/*
-- Drop all existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON storage.objects';
    END LOOP;
END $$;

-- Create very permissive policies
CREATE POLICY "allow_all_pdf_storage" ON storage.objects
FOR ALL USING (bucket_id = 'pdf_storage');
*/
