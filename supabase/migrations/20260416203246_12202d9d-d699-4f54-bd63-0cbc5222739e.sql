-- Remove broad SELECT policies that allow listing all files in public buckets.
-- Public buckets continue to serve individual files via their public URL endpoint
-- (which does not go through RLS), so direct image links keep working.
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Bike photos are publicly viewable" ON storage.objects;
