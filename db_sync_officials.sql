-- SYNC OFFICIALS: Backfill 'Dirigentes' from Whitelist to Team Staff table
DO $$
DECLARE entry RECORD;
target_team_id BIGINT;
found_profile_id UUID;
BEGIN FOR entry IN
SELECT email,
    full_name,
    assigned_team_name
FROM public.allowed_users
WHERE assigned_role = 'official' LOOP -- 1. Find Team ID
SELECT id INTO target_team_id
FROM public.teams
WHERE lower(name) = lower(entry.assigned_team_name)
LIMIT 1;
-- 2. Find Profile ID (Common if they already logged in)
SELECT id INTO found_profile_id
FROM public.profiles
WHERE lower(email) = lower(entry.email)
LIMIT 1;
IF target_team_id IS NOT NULL THEN -- 3. Insert or Update Team Staff
INSERT INTO public.team_staff (team_id, profile_id, name, email, role)
VALUES (
        target_team_id,
        found_profile_id,
        entry.full_name,
        entry.email,
        'Dirigente'
    ) ON CONFLICT (email) DO
UPDATE
SET team_id = EXCLUDED.team_id,
    profile_id = COALESCE(team_staff.profile_id, EXCLUDED.profile_id),
    name = EXCLUDED.name;
RAISE NOTICE 'Sincronizado: % (%) en equipo %',
entry.full_name,
entry.email,
entry.assigned_team_name;
ELSE RAISE NOTICE '⚠️ No se encontró el equipo % para %',
entry.assigned_team_name,
entry.full_name;
END IF;
END LOOP;
END $$;