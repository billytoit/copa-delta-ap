-- SYNC SCRIPT: Connect "Last Year's Roster" (Players) with "Whitelist" (Allowed Users)
-- 1. SAFETY: Ensure 'players' table has the linking columns (in case they were lost during import)
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id),
    ADD COLUMN IF NOT EXISTS email TEXT;
-- 2. SYNC: Backfill 'assigned_team_name' in allowed_users
-- This looks at the existing Players table, finds the team, and updates the Whitelist.
WITH matched_data AS (
    SELECT p.name as player_name,
        t.name as team_name
    FROM players p
        JOIN teams t ON p.team_id = t.id
)
UPDATE allowed_users au
SET assigned_team_name = md.team_name
FROM matched_data md
WHERE lower(au.full_name) = lower(md.player_name)
    AND (
        au.assigned_team_name IS NULL
        OR au.assigned_team_name = ''
    );
-- 3. REPORT: Show how many users now have a team assigned
SELECT count(*) as total_users,
    count(assigned_team_name) as users_with_team,
    count(*) - count(assigned_team_name) as still_unassigned
FROM allowed_users;
-- 4. VERIFY: Show a sample of successfully linked users
SELECT full_name,
    assigned_team_name
FROM allowed_users
WHERE assigned_team_name IS NOT NULL
LIMIT 10;