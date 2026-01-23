-- MASTER SCRIPT: ACCESS CONTROL & TEST SETUP (UPDATED)
-- Includes FIX for "Check Constraint" violation
-- 0. FIX CHECK CONSTRAINT (CRITICAL)
-- We need to ensure the 'role' column allows 'player' and 'pending'
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_role_check CHECK (
        role IN (
            'admin',
            'player',
            'official',
            'veedor',
            'arbitro',
            'operator',
            'fan',
            'invitado',
            'pending'
        )
    );
-- 1. CREAR TABLAS (Whitelist y Perfiles)
CREATE TABLE IF NOT EXISTS allowed_users (
    email TEXT PRIMARY KEY,
    full_name TEXT,
    cedula TEXT,
    phone TEXT,
    assigned_role TEXT DEFAULT 'fan'
);
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin Manage Whitelist" ON allowed_users;
CREATE POLICY "Admin Manage Whitelist" ON allowed_users FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = auth.uid()
            AND role = 'admin'
    )
);
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
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Profiles" ON profiles;
CREATE POLICY "Public Read Profiles" ON profiles FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Users Update Own Profile" ON profiles;
CREATE POLICY "Users Update Own Profile" ON profiles FOR
UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users Insert Own Profile" ON profiles;
CREATE POLICY "Users Insert Own Profile" ON profiles FOR
INSERT WITH CHECK (auth.uid() = id);
-- 2. TRIGGER "PORTERO"
CREATE OR REPLACE FUNCTION public.handle_user_verification() RETURNS trigger AS $$
DECLARE whitelist_entry record;
BEGIN
SELECT * INTO whitelist_entry
FROM allowed_users
WHERE email = new.email;
IF whitelist_entry IS NOT NULL THEN -- APROBADO
INSERT INTO public.profiles (id, email, full_name, cedula, phone)
VALUES (
        new.id,
        new.email,
        whitelist_entry.full_name,
        whitelist_entry.cedula,
        whitelist_entry.phone
    ) ON CONFLICT (id) DO
UPDATE
SET full_name = EXCLUDED.full_name;
INSERT INTO public.user_roles (user_id, email, role)
VALUES (
        new.id,
        new.email,
        COALESCE(whitelist_entry.assigned_role, 'fan')
    ) ON CONFLICT (user_id) DO
UPDATE
SET role = EXCLUDED.role;
ELSE -- DENEGADO (PENDING)
INSERT INTO public.user_roles (user_id, email, role)
VALUES (new.id, new.email, 'pending') ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.profiles (id, email)
VALUES (new.id, new.email) ON CONFLICT (id) DO NOTHING;
END IF;
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_user_verification();
-- 3. DATOS DE PRUEBA
INSERT INTO public.allowed_users (email, full_name, assigned_role)
VALUES (
        'lovocomunicaciones@gmail.com',
        'Administrador Principal',
        'admin'
    ) ON CONFLICT (email) DO
UPDATE
SET assigned_role = 'admin';
UPDATE public.user_roles
SET role = 'player'
WHERE email = 'bhiggins.p@gmail.com';