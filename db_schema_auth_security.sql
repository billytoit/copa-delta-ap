-- SECURITY OVERHAUL: Strict RLS and Auth Integration
-- This script secures the database for production use with Supabase Auth.
-- 1. Enable RLS on all sensitive tables (Just in case)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; -- Removed as table does not exist
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_participations ENABLE ROW LEVEL SECURITY;
-- 2. Clean up old "Anon/Public" policies
-- We drop the permissive policies we created for the Demo phase
DROP POLICY IF EXISTS "Public Update Teams" ON teams;
DROP POLICY IF EXISTS "Public Insert Teams" ON teams;
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public read user_roles" ON user_roles;
DROP POLICY IF EXISTS "Admin/Anon insert user_roles" ON user_roles;
DROP POLICY IF EXISTS "Admin/Anon update user_roles" ON user_roles;
-- 3. Define "Is Admin" helper (Optional but clean)
-- Note: Supabase policies don't support functions easily in all tiers without complexity, 
-- so we'll stick to direct EXISTS checks for robustness.
-- -------------------------------------------------------
-- USER ROLES (The core of our permission system)
-- -------------------------------------------------------
-- Everyone can read roles (needed to check their own role)
CREATE POLICY "Read User Roles" ON user_roles FOR
SELECT USING (true);
-- Only Admins can Insert/Update/Delete roles
CREATE POLICY "Admin Manage Roles" ON user_roles FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM user_roles ur
        WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
    )
);
-- AUTO-ASSIGN ROLE ON SIGNUP
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$ BEGIN
INSERT INTO public.user_roles (user_id, email, role)
VALUES (new.id, new.email, 'invitado') ON CONFLICT (email) DO
UPDATE
SET user_id = new.id;
-- Link existing email invite to the new auth user
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
-- -------------------------------------------------------
-- TEAMS & PLAYERS
-- -------------------------------------------------------
-- Read: Public
-- Write: Admins & Operators
CREATE POLICY "Admins Modify Teams" ON teams FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = auth.uid()
            AND role IN ('admin', 'operador')
    )
);
-- -------------------------------------------------------
-- MATCHES & EVENTS
-- -------------------------------------------------------
-- Read: Public
-- Write: Admins, Officials (Planilleros), Referees
CREATE POLICY "Officials Manage Matches" ON matches FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM user_roles
            WHERE user_id = auth.uid()
                AND role IN ('admin', 'official', 'veedor', 'arbitro')
        )
    );
CREATE POLICY "Officials Manage Events" ON match_events FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = auth.uid()
            AND role IN ('admin', 'official', 'veedor', 'arbitro')
    )
);
-- -------------------------------------------------------
-- STORAGE (Logos & Photos)
-- -------------------------------------------------------
-- Read: Public
-- Write: Authenticated Users (Broad for now to allow features, ideally Admin only)
CREATE POLICY "Auth Upload Storage" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id IN ('team-logos', 'images'));
CREATE POLICY "Auth Update Storage" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id IN ('team-logos', 'images'));
-- -------------------------------------------------------
-- POLLS (Votaciones)
-- -------------------------------------------------------
-- Read: Public
-- Create Polls: Admins
CREATE POLICY "Admins Create Polls" ON polls FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = auth.uid()
            AND role = 'admin'
    )
);
-- Vote: Authenticated Users only
CREATE POLICY "Auth Vote Participation" ON poll_participations FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id::text);
-- -------------------------------------------------------
-- MANUAL FIX (One-time)
-- Link existing 'admin@copadelta.com' to real user if you sign up with that email manually later.
-- This is handled by the Trigger above automatically!