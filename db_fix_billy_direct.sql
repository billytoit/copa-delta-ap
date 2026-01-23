-- FORCE FIX FOR BILLY
-- This enables your profile specifically.
DO $$
DECLARE my_profile_id UUID;
atletico_id BIGINT;
BEGIN -- 1. Get Your Profile ID
SELECT id INTO my_profile_id
FROM profiles
WHERE email = 'bhiggins.p@gmail.com';
-- 2. Get Atlético Team ID
SELECT id INTO atletico_id
FROM teams
WHERE name = 'Atlético';
IF my_profile_id IS NOT NULL
AND atletico_id IS NOT NULL THEN -- A. Clean up any messed up records for you
DELETE FROM players
WHERE profile_id = my_profile_id;
DELETE FROM players
WHERE email = 'bhiggins.p@gmail.com';
-- B. Insert FRESH Correct Record
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
        -- Hardcoded to ensure it works
        atletico_id,
        10,
        'Billy'
    );
END IF;
END $$;