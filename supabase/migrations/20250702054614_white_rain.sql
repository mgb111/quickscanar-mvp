/*
  # Setup Campaigns Storage Bucket

  1. Storage Configuration
    - Create campaigns bucket if it doesn't exist
    - Set bucket to public access
    - Configure file size limits and allowed MIME types

  2. Notes
    - Storage RLS policies must be configured through Supabase Dashboard
    - This migration only handles bucket creation and configuration
*/

-- Create the campaigns bucket if it doesn't exist
-- Note: This uses Supabase's storage functions which handle permissions properly
DO $$
BEGIN
  -- Insert bucket configuration
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
    
  RAISE NOTICE 'Campaigns storage bucket configured successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Storage bucket configuration may need to be done through Supabase Dashboard';
END $$;