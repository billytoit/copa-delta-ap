-- PLAYER SEEDING & TEAM ASSIGNMENT SCHEMA
-- 1. Update Whitelist (allowed_users) to store Excel data
ALTER TABLE public.allowed_users
ADD COLUMN IF NOT EXISTS birth_date DATE,
    ADD COLUMN IF NOT EXISTS assigned_team_name TEXT;
-- 2. Update Profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS birth_date DATE;
-- 3. Link Players Table to Auth System
-- This is critical: It connects a "Roster Player" (Stats) with a "User Profile" (Auth)
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id),
    ADD COLUMN IF NOT EXISTS email TEXT;
-- 4. LOGIC: The "Auto-Assign" Trigger
-- When a user signs up (or we simulated it), this runs.
CREATE OR REPLACE FUNCTION public.handle_user_verification() RETURNS trigger AS $$
DECLARE whitelist_entry record;
target_team_id bigint;
BEGIN -- A. Check Whitelist
SELECT * INTO whitelist_entry
FROM allowed_users
WHERE email = new.email;
IF whitelist_entry IS NOT NULL THEN -- 1. CREATE/UPDATE PROFILE (Now with Birth Date)
INSERT INTO public.profiles (id, email, full_name, cedula, phone, birth_date)
VALUES (
        new.id,
        new.email,
        whitelist_entry.full_name,
        whitelist_entry.cedula,
        whitelist_entry.phone,
        whitelist_entry.birth_date
    ) ON CONFLICT (id) DO
UPDATE
SET full_name = EXCLUDED.full_name,
    cedula = EXCLUDED.cedula,
    birth_date = EXCLUDED.birth_date;
-- 2. ASSIGN ROLE
INSERT INTO public.user_roles (user_id, email, role)
VALUES (
        new.id,
        new.email,
        COALESCE(whitelist_entry.assigned_role, 'fan')
    ) ON CONFLICT (user_id) DO
UPDATE
SET role = EXCLUDED.role;
-- 3. AUTO-ASSIGN TEAM (The "Squad Builder" Magic)
-- If the Excel had a team name, try to find it and link the player.
IF whitelist_entry.assigned_team_name IS NOT NULL THEN -- Find Team ID by Name (Case insensitive-ish)
SELECT id INTO target_team_id
FROM teams
WHERE lower(name) = lower(whitelist_entry.assigned_team_name)
LIMIT 1;
IF target_team_id IS NOT NULL THEN -- Insert or Link to existing Player Record
-- Strategy: If a player with this name already exists in that team, link them.
-- Otherwise, create a new player entry.
-- Check if player exists by Name + Team (to avoid duplicates if re-running)
UPDATE public.players
SET profile_id = new.id,
    email = new.email
WHERE team_id = target_team_id
    AND lower(name) = lower(whitelist_entry.full_name);
-- If we didn't link anyone (Row count = 0), Insert new
IF NOT FOUND THEN
INSERT INTO public.players (team_id, name, profile_id, email)
VALUES (
        target_team_id,
        whitelist_entry.full_name,
        new.id,
        new.email
    );
END IF;
END IF;
END IF;
ELSE -- B. RESTRICTED USER (Pending)
INSERT INTO public.user_roles (user_id, email, role)
VALUES (new.id, new.email, 'pending') ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.profiles (id, email)
VALUES (new.id, new.email) ON CONFLICT (id) DO NOTHING;
END IF;
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Re-attach Trigger (Just to be safe and ensure latest version is used)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_user_verification();