-- Create a new public bucket 'player-photos'
insert into storage.buckets (id, name, public)
values ('player-photos', 'player-photos', true) on conflict (id) do nothing;
-- Policy 1: Public Read Access (Everyone can see player photos)
DROP POLICY IF EXISTS "Public Read Photos" ON storage.objects;
CREATE POLICY "Public Read Photos" ON storage.objects FOR
SELECT USING (bucket_id = 'player-photos');
-- Policy 2: Authenticated Upload (Admins/Officials will use this)
-- We allow any authenticated user to upload for now, but the UI will hide the button for non-admins.
-- This prevents "Anon" users (if any) from spamming, but allows Admins to work.
DROP POLICY IF EXISTS "Authenticated Upload Photos" ON storage.objects;
CREATE POLICY "Authenticated Upload Photos" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'player-photos');
DROP POLICY IF EXISTS "Authenticated Update Photos" ON storage.objects;
CREATE POLICY "Authenticated Update Photos" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'player-photos');