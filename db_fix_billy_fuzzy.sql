-- SAFE FIX WITH LOGGING
DO $$
DECLARE my_profile_id UUID;
atletico_id BIGINT;
BEGIN -- 1. Find Profile
SELECT id INTO my_profile_id
FROM profiles
WHERE email = 'bhiggins.p@gmail.com';
RAISE NOTICE 'Profile ID: %',
my_profile_id;
-- 2. Find Team (Fuzzy Match to avoid accent issues)
-- Matches 'Atletico', 'Atlético', 'ATLETICO', etc.
SELECT id INTO atletico_id
FROM teams
WHERE unaccent(lower(name)) LIKE '%atletico%'
LIMIT 1;
-- Fallback: If unaccent not available, use simple like
IF atletico_id IS NULL THEN
SELECT id INTO atletico_id
FROM teams
WHERE lower(name) LIKE 'atl%tico'
LIMIT 1;
END IF;
RAISE NOTICE 'Team ID: %',
atletico_id;
IF my_profile_id IS NOT NULL
AND atletico_id IS NOT NULL THEN -- 3. Delete Old
DELETE FROM players
WHERE profile_id = my_profile_id;
-- 4. Insert New
INSERT INTO players (
        profile_id,
        email,
        name,
        team_id,
        number,
        nickname
    )
VALUES (
        my_profile_id,
        'bhiggins.p@gmail.com',
        'Billy Higgins',
        atletico_id,
        10,
        'Billy'
    );
RAISE NOTICE 'Success! Player inserted.';
ELSE RAISE NOTICE 'ERROR: Could not find Profile or Team.';
END IF;
END $$;