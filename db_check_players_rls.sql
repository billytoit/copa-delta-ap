-- CHECK RLS ON PLAYERS
-- 1. Is RLS enabled?
SELECT tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'players';
-- 2. What policies exist?
SELECT *
FROM pg_policies
WHERE tablename = 'players';
-- 3. Double check the record exists linked to the profile
SELECT p.id,
    p.name,
    p.team_id,
    t.name as team_name,
    p.profile_id
FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
WHERE p.email = 'bhiggins.p@gmail.com';