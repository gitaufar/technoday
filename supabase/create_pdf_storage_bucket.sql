-- Create pdf_storage bucket for storing contract files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdf_storage',
  'pdf_storage', 
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'image/bmp']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for pdf_storage bucket
CREATE POLICY "pdf_storage_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'pdf_storage');

CREATE POLICY "pdf_storage_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'pdf_storage');

CREATE POLICY "pdf_storage_update_policy" ON storage.objects
FOR UPDATE USING (bucket_id = 'pdf_storage');

CREATE POLICY "pdf_storage_delete_policy" ON storage.objects
FOR DELETE USING (bucket_id = 'pdf_storage');
