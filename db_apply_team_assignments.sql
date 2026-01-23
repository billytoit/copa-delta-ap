-- FORCE APPLY TEAMS FROM WHITELIST
-- This script runs the "Assignment Logic" for users who already registered
-- before the Excel was uploaded.
DO $$
DECLARE r RECORD;
t_id BIGINT;
u_id UUID;
BEGIN -- Loop through allowed_users who have a team assigned
FOR r IN
SELECT *
FROM allowed_users
WHERE assigned_team_name IS NOT NULL LOOP -- 1. Find Team ID
SELECT id INTO t_id
FROM teams
WHERE lower(name) = lower(r.assigned_team_name)
LIMIT 1;
-- 2. Find User ID (from profiles)
SELECT id INTO u_id
FROM profiles
WHERE email = r.email;
-- 3. If both exist, Sync them
IF t_id IS NOT NULL
AND u_id IS NOT NULL THEN -- A. Try to find an existing Player record for this User (by profile_id or email)
UPDATE players
SET team_id = t_id,
    name = r.full_name -- Update name to match official list
WHERE profile_id = u_id
    OR email = r.email;
-- B. If not found, Insert a new Player record
IF NOT FOUND THEN
INSERT INTO players (profile_id, email, name, team_id, number)
VALUES (u_id, r.email, r.full_name, t_id, 99);
-- Default number 99
END IF;
END IF;
END LOOP;
END $$;
-- Verify the result for bhiggins
SELECT p.name,
    t.name as team
FROM players p
    JOIN teams t ON p.team_id = t.id
WHERE p.email = 'bhiggins.p@gmail.com';