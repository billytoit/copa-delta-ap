-- FIX RLS ON PLAYERS
-- The front-end needs to read the players table to show "My Team"
-- 1. Ensure RLS is enabled (Good practice)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
-- 2. Drop restrictice policies if any match (Clean slate)
DROP POLICY IF EXISTS "Public Read Players" ON players;
DROP POLICY IF EXISTS "Authenticated Read Players" ON players;
-- 3. Create permissive Read Policy
-- Everyone (Authenticated or Anon) should be able to see who plays where.
CREATE POLICY "Public Read Players" ON players FOR
SELECT USING (true);
-- 4. Verify Record Existence (Just a check)
SELECT name,
    team_id
FROM players
WHERE email = 'bhiggins.p@gmail.com';