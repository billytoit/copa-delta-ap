-- EXCLUSIVE ACCESS SYSTEM
-- 1. Whitelist Table (Load your Excel data here)
CREATE TABLE IF NOT EXISTS allowed_users (
    email TEXT PRIMARY KEY,
    full_name TEXT,
    cedula TEXT,
    phone TEXT,
    assigned_role TEXT DEFAULT 'fan' -- 'player', 'official', 'admin', 'fan'
);
-- Enable RLS (Admin only for security)
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin Manage Whitelist" ON allowed_users FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = auth.uid()
            AND role = 'admin'
    )
);
-- 2. Profiles Table (Live data linked to Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    nickname TEXT,
    cedula TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- RLS for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Profiles" ON profiles FOR
SELECT USING (true);
CREATE POLICY "Users Update Own Profile" ON profiles FOR
UPDATE USING (auth.uid() = id);
CREATE POLICY "Users Insert Own Profile" ON profiles FOR
INSERT WITH CHECK (auth.uid() = id);
-- 3. TRIGGER: The "Bouncer" Logic
CREATE OR REPLACE FUNCTION public.handle_user_verification() RETURNS trigger AS $$
DECLARE whitelist_entry record;
BEGIN -- Check if email exists in Whitelist
SELECT * INTO whitelist_entry
FROM allowed_users
WHERE email = new.email;
IF whitelist_entry IS NOT NULL THEN -- A. APPROVED USER
-- 1. Create Profile with verified data
INSERT INTO public.profiles (id, email, full_name, cedula, phone)
VALUES (
        new.id,
        new.email,
        whitelist_entry.full_name,
        whitelist_entry.cedula,
        whitelist_entry.phone
    ) ON CONFLICT (id) DO
UPDATE
SET full_name = EXCLUDED.full_name,
    cedula = EXCLUDED.cedula;
-- 2. Assign Role (Auto-Authorize)
INSERT INTO public.user_roles (user_id, email, role)
VALUES (
        new.id,
        new.email,
        COALESCE(whitelist_entry.assigned_role, 'fan')
    ) ON CONFLICT (user_id) DO
UPDATE
SET role = EXCLUDED.role;
ELSE -- B. UNKNOWN USER (Restricted)
-- Role 'pending' limits access
INSERT INTO public.user_roles (user_id, email, role)
VALUES (new.id, new.email, 'pending') ON CONFLICT (user_id) DO NOTHING;
-- Create empty profile for them to fill later
INSERT INTO public.profiles (id, email)
VALUES (new.id, new.email) ON CONFLICT (id) DO NOTHING;
END IF;
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Re-assign Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_user_verification();