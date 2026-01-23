-- COMPREHENSIVE DEBUG FOR BHIGGINS.P (CORRECTED)
-- 1. Get Auth ID and Profile Data
WITH target_user AS (
    SELECT id,
        email,
        created_at
    FROM auth.users
    WHERE email = 'bhiggins.p@gmail.com'
)
SELECT 'AUTH_USER' as check_type,
    u.id as user_id,
    u.email,
    p.id as profile_id,
    p.full_name,
    p.birth_date
FROM target_user u
    LEFT JOIN public.profiles p ON u.id = p.id;
-- 2. Check Player Record Linkage
-- Using 'id' instead of 'player_id' which was the error
SELECT 'PLAYER_RECORD' as check_type,
    id as player_record_id,
    name,
    email,
    profile_id,
    team_id,
    (
        SELECT name
        FROM teams
        WHERE id = players.team_id
    ) as team_name
FROM players
where email = 'bhiggins.p@gmail.com'
    OR name ILIKE '%Higgins%';
-- 3. Check Allowed Users Entry
SELECT 'ALLOWED_USER' as check_type,
    email,
    assigned_team_name
FROM allowed_users
WHERE email = 'bhiggins.p@gmail.com';
-- 4. Check RLS Policies on Players
SELECT tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'players';