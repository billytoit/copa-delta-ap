-- DIAGNOSTIC: Check Billy's Data State
-- This helps us see why he has "No Team"
SELECT '1. Allowed User' as check_type,
    email,
    full_name,
    assigned_team_name
FROM allowed_users
WHERE email = 'bhiggins.p@gmail.com';
SELECT '2. Profile' as check_type,
    id,
    email,
    full_name
FROM profiles
WHERE email = 'bhiggins.p@gmail.com';
SELECT '3. Player Record (Linked by Profile)' as check_type,
    id,
    name,
    team_id,
    profile_id
FROM players
WHERE profile_id IN (
        SELECT id
        FROM profiles
        WHERE email = 'bhiggins.p@gmail.com'
    );
SELECT '4. Player Record (Linked by Name?)' as check_type,
    id,
    name,
    team_id,
    profile_id
FROM players
WHERE lower(name) LIKE '%billy%';