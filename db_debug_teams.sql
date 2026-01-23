-- CHECK DATA & RLS
-- 1. Check strict equality for Team Name
SELECT id,
    name,
    encode(name::bytea, 'hex') as hex_name
FROM teams
WHERE name LIKE 'Atl%';
-- 2. Check if a player record actually exists for Billy
SELECT *
FROM players
WHERE email = 'bhiggins.p@gmail.com';
-- 3. Check RLS Policies on Players
SELECT *
FROM pg_policies
WHERE tablename = 'players';