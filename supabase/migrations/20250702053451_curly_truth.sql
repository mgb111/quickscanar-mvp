/*
  # Fix Campaign RLS Policies and Schema

  1. Schema Updates
    - Add missing columns to campaigns table (video_url, marker_url, hosted_url)
    
  2. Storage Setup
    - Create campaigns storage bucket if it doesn't exist
    - Set up proper RLS policies for storage operations
    
  3. Table Policies
    - Update campaigns table policies for proper anonymous access
    - Ensure all CRUD operations work for anonymous users
*/

-- Add missing columns to campaigns table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN video_url text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'marker_url'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN marker_url text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'hosted_url'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN hosted_url text;
  END IF;
END $$;

-- Update the id column to use text instead of bigint for UUID compatibility
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'id' AND data_type = 'bigint'
  ) THEN
    ALTER TABLE campaigns ALTER COLUMN id TYPE text;
  END IF;
END $$;

-- Create storage bucket for campaigns if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaigns', 'campaigns', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Allow anonymous campaign creation" ON campaigns;
DROP POLICY IF EXISTS "Allow anonymous campaign reading" ON campaigns;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON campaigns;

-- Create comprehensive policies for campaigns table
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

-- Storage policies for campaigns bucket
CREATE POLICY "Enable anonymous upload to campaigns bucket"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'campaigns');

CREATE POLICY "Enable anonymous read from campaigns bucket"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'campaigns');

CREATE POLICY "Enable anonymous update in campaigns bucket"
  ON storage.objects
  FOR UPDATE
  TO anon
  USING (bucket_id = 'campaigns')
  WITH CHECK (bucket_id = 'campaigns');

CREATE POLICY "Enable anonymous delete from campaigns bucket"
  ON storage.objects
  FOR DELETE
  TO anon
  USING (bucket_id = 'campaigns');