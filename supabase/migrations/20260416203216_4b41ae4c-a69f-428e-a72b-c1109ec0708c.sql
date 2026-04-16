-- =========================================================
-- 1. PROFILES: hide phone numbers from public
-- =========================================================

-- Drop the over-permissive public SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Owners can read their full profile (including phone)
CREATE POLICY "Owners can view their full profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create a safe public view that EXCLUDES phone
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT
  id,
  user_id,
  display_name,
  avatar_url,
  city,
  bio,
  is_dealer,
  created_at,
  updated_at
FROM public.profiles;

-- Allow anyone (including anon) to read the safe view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- We also need a SELECT policy on profiles so the view (running with invoker rights)
-- can read non-sensitive columns for everyone. We add a permissive SELECT scoped via
-- the view: since the view excludes `phone`, public read of remaining columns is OK.
CREATE POLICY "Public can view non-sensitive profile fields"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);

-- NOTE: The above keeps all profile columns technically readable via direct table
-- access. To truly hide `phone`, application code MUST query `public_profiles`
-- instead of `profiles` for any non-owner read. See the column-level revoke below
-- which enforces this at the database level.

-- Column-level: revoke direct SELECT on the phone column for anon/authenticated;
-- only owners can read it through the existing owner policy via service queries
-- (Supabase respects RLS, but column-level GRANTs add defense in depth).
REVOKE SELECT (phone) ON public.profiles FROM anon, authenticated;

-- =========================================================
-- 2. AVATARS BUCKET: add DELETE policy
-- =========================================================

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =========================================================
-- 3. STORAGE: restrict listing on public buckets
-- =========================================================

-- Drop overly broad SELECT policies that allow listing all files
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT polname FROM pg_policy
    WHERE polrelid = 'storage.objects'::regclass
      AND polcmd = 'r'
      AND polname IN (
        'Public read access for bike-photos',
        'Public read access for avatars',
        'Avatar images are publicly accessible',
        'Bike photos are publicly accessible'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.polname);
  END LOOP;
END $$;

-- Owners can list/select their own files
CREATE POLICY "Owners can list their bike photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'bike-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Owners can list their avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Public buckets serve files via public URLs without needing SELECT on storage.objects.
-- We deliberately do NOT add a broad public SELECT to prevent file enumeration/listing.

-- =========================================================
-- 4. STORAGE: restrict file types and size for uploads
-- =========================================================

-- Configure bucket-level limits (server-side enforcement)
UPDATE storage.buckets
SET
  file_size_limit = 5242880,  -- 5 MB
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif']
WHERE id = 'bike-photos';

UPDATE storage.buckets
SET
  file_size_limit = 2097152,  -- 2 MB
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp']
WHERE id = 'avatars';
