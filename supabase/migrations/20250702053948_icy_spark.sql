/*
  # Create Storage Bucket and Policies for Campaigns

  1. Storage Setup
    - Create 'campaigns' storage bucket if it doesn't exist
    - Enable public access for the bucket
    
  2. Storage Policies
    - Allow anonymous users to insert files into campaigns bucket
    - Allow anonymous users to select/read files from campaigns bucket
    - Allow anonymous users to update files in campaigns bucket
    - Allow anonymous users to delete files from campaigns bucket

  3. Notes
    - This enables full CRUD operations on the campaigns storage bucket for anonymous users
    - Files will be publicly accessible once uploaded
*/

-- Create the campaigns bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaigns',
  'campaigns',
  true,
  104857600, -- 100MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'video/mp4'];

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous users to insert files into campaigns bucket
CREATE POLICY "Allow anonymous insert into campaigns bucket"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'campaigns');

-- Policy to allow anonymous users to select files from campaigns bucket
CREATE POLICY "Allow anonymous select from campaigns bucket"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'campaigns');

-- Policy to allow anonymous users to update files in campaigns bucket
CREATE POLICY "Allow anonymous update in campaigns bucket"
ON storage.objects
FOR UPDATE
TO anon
USING (bucket_id = 'campaigns')
WITH CHECK (bucket_id = 'campaigns');

-- Policy to allow anonymous users to delete files from campaigns bucket
CREATE POLICY "Allow anonymous delete from campaigns bucket"
ON storage.objects
FOR DELETE
TO anon
USING (bucket_id = 'campaigns');