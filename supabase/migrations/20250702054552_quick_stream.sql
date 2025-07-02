/*
  # Disable RLS on storage objects

  1. Changes
    - Disable row level security on storage.objects table
    - This allows anonymous users to upload/access files without policy restrictions

  2. Security Note
    - This makes the storage bucket publicly accessible
    - Only use this for public file storage scenarios
*/

-- Disable RLS on storage.objects table
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;