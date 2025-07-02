/*
  # Fix AR Campaign Generator Database Setup

  1. Clean Setup
    - Drop existing conflicting policies
    - Recreate campaigns table with correct schema
    - Setup storage bucket with proper permissions

  2. Security
    - Enable RLS on campaigns table
    - Create anonymous access policies for campaigns
    - Setup storage bucket as public with size limits
*/

-- Clean up existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous uploads to campaigns bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous reads from campaigns bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous updates to campaigns bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous deletes from campaigns bucket" ON storage.objects;
DROP POLICY IF EXISTS "Enable anonymous upload to campaigns bucket" ON storage.objects;
DROP POLICY IF EXISTS "Enable anonymous read from campaigns bucket" ON storage.objects;
DROP POLICY IF EXISTS "Enable anonymous update in campaigns bucket" ON storage.objects;
DROP POLICY IF EXISTS "Enable anonymous delete from campaigns bucket" ON storage.objects;

-- Ensure campaigns table has correct structure
DROP TABLE IF EXISTS campaigns CASCADE;

CREATE TABLE campaigns (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  video_url text,
  marker_url text,
  hosted_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on campaigns table
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for campaigns table
CREATE POLICY "Enable anonymous insert for campaigns"
  ON campaigns
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enable anonymous select for campaigns"
  ON campaigns
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable anonymous update for campaigns"
  ON campaigns
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable anonymous delete for campaigns"
  ON campaigns
  FOR DELETE
  TO anon
  USING (true);

-- Create or update storage bucket
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

-- Create storage policies (these should work since bucket is public)
CREATE POLICY "Allow anonymous storage operations on campaigns"
  ON storage.objects
  FOR ALL
  TO anon
  USING (bucket_id = 'campaigns')
  WITH CHECK (bucket_id = 'campaigns');