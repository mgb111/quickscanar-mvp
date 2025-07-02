/*
  # Add Storage Policies for Campaigns Bucket

  1. Storage Policies
    - Enable anonymous users to upload files to the 'campaigns' bucket
    - Enable anonymous users to read files from the 'campaigns' bucket
    - Enable anonymous users to update files in the 'campaigns' bucket
    - Enable anonymous users to delete files from the 'campaigns' bucket

  2. Security
    - Policies are scoped to the 'campaigns' bucket only
    - Anonymous access is granted for all CRUD operations on storage objects
*/

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

-- Policy to allow anonymous users to update files in campaigns bucket
CREATE POLICY "Allow anonymous updates to campaigns bucket"
ON storage.objects
FOR UPDATE
TO anon
USING (bucket_id = 'campaigns')
WITH CHECK (bucket_id = 'campaigns');

-- Policy to allow anonymous users to delete files from campaigns bucket
CREATE POLICY "Allow anonymous deletes from campaigns bucket"
ON storage.objects
FOR DELETE
TO anon
USING (bucket_id = 'campaigns');