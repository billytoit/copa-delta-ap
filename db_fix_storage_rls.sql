-- FIX: Allow anonymous uploads to 'team-logos' for current Demo/Testing phase
-- This is necessary because the app currently uses a "Demo Login" which doesn't establish
-- a real Supabase Auth session, so the user appears as 'anon' to the database.
-- Drop the restrictive policy
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
-- Create permissive policy for Demo Mode (WARNING: Allows anyone to upload)
CREATE POLICY "Public Insert" ON storage.objects FOR
INSERT TO public WITH CHECK (bucket_id = 'team-logos');
CREATE POLICY "Public Update" ON storage.objects FOR
UPDATE TO public USING (bucket_id = 'team-logos');
-- Ensure Select is still public (it was, but just to be safe)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Select" ON storage.objects FOR
SELECT USING (bucket_id = 'team-logos');