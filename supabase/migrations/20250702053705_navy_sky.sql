/*
  # Create storage policies for campaigns bucket

  1. Storage Policies
    - Allow anonymous users to upload files to campaigns bucket
    - Allow anonymous users to read files from campaigns bucket
    - Allow anonymous users to delete files from campaigns bucket (for cleanup)

  2. Security
    - Enable RLS on storage.objects
    - Add policies for anonymous access to campaigns bucket
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaigns', 'campaigns', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous users to upload files to campaigns bucket
CREATE POLICY "Allow anonymous uploads to campaigns bucket"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'campaigns');

-- Policy to allow anonymous users to read files from campaigns bucket
CREATE POLICY "Allow anonymous reads from campaigns bucket"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'campaigns');

-- Policy to allow anonymous users to delete files from campaigns bucket
CREATE POLICY "Allow anonymous deletes from campaigns bucket"
ON storage.objects
FOR DELETE
TO anon
USING (bucket_id = 'campaigns');

-- Policy to allow anonymous users to update files in campaigns bucket
CREATE POLICY "Allow anonymous updates to campaigns bucket"
ON storage.objects
FOR UPDATE
TO anon
USING (bucket_id = 'campaigns')
WITH CHECK (bucket_id = 'campaigns');