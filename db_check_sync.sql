-- Check counts
SELECT 'allowed_users' as table_name,
    count(*)
FROM allowed_users
UNION ALL
SELECT 'players',
    count(*)
FROM players
UNION ALL
SELECT 'allowed_users_null_team',
    count(*)
FROM allowed_users
WHERE assigned_team_name IS NULL
    OR assigned_team_name = '';
-- optional: preview potential matches
SELECT au.full_name,
    t.name as inferred_team
FROM allowed_users au
    JOIN players p ON lower(p.name) = lower(au.full_name)
    JOIN teams t ON p.team_id = t.id
WHERE (
        au.assigned_team_name IS NULL
        OR au.assigned_team_name = ''
    )
LIMIT 5;