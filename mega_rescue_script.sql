-- SCRIPT DE RESCATE CONSOLIDADO (Copa Delta)
-- Ejecuta esto en el SQL Editor de Supabase
-- 1. ESTRUCTURA Y COLUMNAS FALTANTES
-- Aseguramos que todas las tablas tengan las columnas de perfil para consistencia
DO $$ BEGIN -- Columnas para officials
IF NOT EXISTS (
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
-- Aseguramos RLS en officials
ALTER TABLE public.officials ENABLE ROW LEVEL SECURITY;
END $$;
-- Política para que los oficiales editen su propio registro
DROP POLICY IF EXISTS "Officials Update Own Record" ON public.officials;
CREATE POLICY "Officials Update Own Record" ON public.officials FOR
UPDATE USING (auth.uid() = id);
-- 2. LIMPIEZA Y RESTAURACIÓN DE WHITELIST
TRUNCATE public.allowed_users;
INSERT INTO public.allowed_users (
        email,
        full_name,
        assigned_role,
        assigned_team_name
    )
VALUES -- Tus cuentas actuales (Preservamos acceso)
    (
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
    -- Xavier (Acceso Principal)
    (
        'xavier.intriago@gmail.com',
        'Xavier Intriago',
        'official',
        'Atlético'
    ),
    -- Cuentas de Prueba (Para Billy)
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
-- 3. LÓGICA DE REGISTRO INTELIGENTE (IGNORA MAYÚSCULAS)
CREATE OR REPLACE FUNCTION public.handle_user_verification() RETURNS trigger AS $$
DECLARE whitelist_entry record;
DECLARE target_team_id bigint;
BEGIN -- Buscar en whitelist (Insensible a mayúsculas)
SELECT * INTO whitelist_entry
FROM public.allowed_users
WHERE lower(email) = lower(new.email);
IF whitelist_entry IS NOT NULL THEN -- A. Crear Perfil
INSERT INTO public.profiles (id, email, full_name)
VALUES (new.id, new.email, whitelist_entry.full_name) ON CONFLICT (id) DO
UPDATE
SET full_name = EXCLUDED.full_name;
-- B. Asignar Rol
INSERT INTO public.user_roles (user_id, email, role)
VALUES (
        new.id,
        new.email,
        COALESCE(whitelist_entry.assigned_role, 'fan')
    ) ON CONFLICT (user_id) DO
UPDATE
SET role = EXCLUDED.role;
-- C. Vincular con Equipo si aplica
IF whitelist_entry.assigned_team_name IS NOT NULL THEN
SELECT id INTO target_team_id
FROM public.teams
WHERE lower(name) = lower(whitelist_entry.assigned_team_name)
LIMIT 1;
IF target_team_id IS NOT NULL THEN -- Si es Dirigente (official con equipo)
IF whitelist_entry.assigned_role = 'official' THEN
INSERT INTO public.team_staff (team_id, profile_id, name, email, role)
VALUES (
        target_team_id,
        new.id,
        whitelist_entry.full_name,
        new.email,
        'Dirigente'
    ) ON CONFLICT (email) DO
UPDATE
SET profile_id = EXCLUDED.profile_id,
    team_id = EXCLUDED.team_id;
END IF;
END IF;
-- Si es Veedor (official sin equipo asignado)
ELSIF whitelist_entry.assigned_role = 'official' THEN
INSERT INTO public.officials (id, name, default_role)
VALUES (new.id, whitelist_entry.full_name, 'Observer') ON CONFLICT (id) DO NOTHING;
END IF;
ELSE -- B. USUARIO DESCONOCIDO -> PENDING
INSERT INTO public.user_roles (user_id, email, role)
VALUES (new.id, new.email, 'pending') ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.profiles (id, email)
VALUES (new.id, new.email) ON CONFLICT (id) DO NOTHING;
END IF;
RETURN new;
EXCEPTION
WHEN OTHERS THEN RETURN new;
-- No bloquear el login si algo falla
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 4. RE-ACTIVAR TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_user_verification();