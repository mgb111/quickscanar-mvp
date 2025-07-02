/*
  # Storage Bucket Setup for Campaigns

  1. Storage Configuration
    - Create campaigns bucket with proper settings
    - Set public access and file size limits
    - Configure allowed MIME types

  2. Notes
    - Storage RLS policies need to be configured via Supabase Dashboard
    - This migration only handles bucket creation and configuration
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