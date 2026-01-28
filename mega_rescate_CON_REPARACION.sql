-- SCRIPT DE RESCATE CONSOLIDADO v2 (Copa Delta)
-- Este script REPARA usuarios existentes que quedaron en 'pending'
-- 1. ESTRUCTURA Y COLUMNAS FALTANTES
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'officials'
        AND column_name = 'nickname'
) THEN
ALTER TABLE public.officials
ADD COLUMN nickname text,
    ADD COLUMN bio text,
    ADD COLUMN job text,
    ADD COLUMN phone text,
    ADD COLUMN instagram text;
END IF;
ALTER TABLE public.officials ENABLE ROW LEVEL SECURITY;
END $$;
DROP POLICY IF EXISTS "Officials Update Own Record" ON public.officials;
CREATE POLICY "Officials Update Own Record" ON public.officials FOR
UPDATE USING (auth.uid() = id);
-- 2. RESTAURACIÓN DE WHITELIST
TRUNCATE public.allowed_users;
INSERT INTO public.allowed_users (
        email,
        full_name,
        assigned_role,
        assigned_team_name
    )
VALUES (
        'bhiggins.p@gmail.com',
        'Billy Higgins',
        'player',
        'Chelsea'
    ),
    (
        'lovocomunicaciones@gmail.com',
        'Administrador Lobo',
        'admin',
        NULL
    ),
    (
        'xavier.intriago@gmail.com',
        'Xavier Intriago',
        'official',
        'Atlético'
    ),
    (
        'test.dirigente@copadelta.com',
        'Test Dirigente Chelsea',
        'official',
        'Chelsea'
    ),
    (
        'test.veedor@copadelta.com',
        'Test Veedor Operativo',
        'official',
        NULL
    );
-- 3. LÓGICA DE REGISTRO (TRIGGER)
CREATE OR REPLACE FUNCTION public.handle_user_verification_logic(user_id uuid, user_email text) RETURNS void AS $$
DECLARE whitelist_entry record;
DECLARE target_team_id bigint;
BEGIN
SELECT * INTO whitelist_entry
FROM public.allowed_users
WHERE lower(email) = lower(user_email);
IF whitelist_entry IS NOT NULL THEN -- Actualizar Perfil
INSERT INTO public.profiles (id, email, full_name)
VALUES (user_id, user_email, whitelist_entry.full_name) ON CONFLICT (id) DO
UPDATE
SET full_name = EXCLUDED.full_name;
-- Actualizar Rol (SACAR DE PENDING)
INSERT INTO public.user_roles (user_id, email, role)
VALUES (
        user_id,
        user_email,
        COALESCE(whitelist_entry.assigned_role, 'fan')
    ) ON CONFLICT (user_id) DO
UPDATE
SET role = EXCLUDED.role;
-- Vincular con Equipo/Staff
IF whitelist_entry.assigned_team_name IS NOT NULL THEN
SELECT id INTO target_team_id
FROM public.teams
WHERE lower(name) = lower(whitelist_entry.assigned_team_name)
LIMIT 1;
IF target_team_id IS NOT NULL
AND whitelist_entry.assigned_role = 'official' THEN
INSERT INTO public.team_staff (team_id, profile_id, name, email, role)
VALUES (
        target_team_id,
        user_id,
        whitelist_entry.full_name,
        user_email,
        'Dirigente'
    ) ON CONFLICT (email) DO
UPDATE
SET profile_id = EXCLUDED.profile_id,
    team_id = EXCLUDED.team_id;
END IF;
ELSIF whitelist_entry.assigned_role = 'official' THEN
INSERT INTO public.officials (id, name, default_role)
VALUES (user_id, whitelist_entry.full_name, 'Observer') ON CONFLICT (id) DO NOTHING;
END IF;
END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger Wrapper
CREATE OR REPLACE FUNCTION public.handle_user_verification() RETURNS trigger AS $$ BEGIN PERFORM public.handle_user_verification_logic(new.id, new.email);
RETURN new;
END $$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_user_verification();
-- 4. ¡PASO CRÍTICO: REPARAR USUARIOS YA REGISTRADOS!
-- Esto procesa a todos los que ya existen en la tabla profiles y los cruza con la whitelist
DO $$
DECLARE r RECORD;
BEGIN FOR r IN
SELECT id,
    email
FROM public.profiles LOOP PERFORM public.handle_user_verification_logic(r.id, r.email);
END LOOP;
END $$;