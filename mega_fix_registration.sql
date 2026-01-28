-- MEGA FIX: ROBOT DE SEGURIDAD ROBUSTO (handle_user_verification)
-- Este script hace que el sistema ignore mayúsculas/minúsculas y sea más tolerante a errores.
CREATE OR REPLACE FUNCTION public.handle_user_verification() RETURNS trigger AS $$
DECLARE whitelist_entry record;
target_team_id bigint;
BEGIN -- 1. BUSCAR EN WHITELIST (IGNORANDO MAYÚSCULAS)
SELECT * INTO whitelist_entry
FROM public.allowed_users
WHERE lower(email) = lower(new.email);
IF whitelist_entry IS NOT NULL THEN -- A. USUARIO RECONOCIDO EN LA LISTA
-- 1. Crear/Actualizar Perfil (profiles)
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
    phone = EXCLUDED.phone,
    birth_date = EXCLUDED.birth_date;
-- 2. Asignar Rol (user_roles)
INSERT INTO public.user_roles (user_id, email, role)
VALUES (
        new.id,
        new.email,
        COALESCE(whitelist_entry.assigned_role, 'fan')
    ) ON CONFLICT (user_id) DO
UPDATE
SET role = EXCLUDED.role;
-- 3. Vincular con Equipo (players o team_staff)
IF whitelist_entry.assigned_team_name IS NOT NULL THEN -- Buscar ID del equipo (ignora tildes y mayúsculas si es posible, aquí usamos lower)
SELECT id INTO target_team_id
FROM public.teams
WHERE lower(name) = lower(whitelist_entry.assigned_team_name)
LIMIT 1;
IF target_team_id IS NOT NULL THEN -- Caso Jugador
IF whitelist_entry.assigned_role = 'player' THEN
UPDATE public.players
SET profile_id = new.id,
    email = new.email
WHERE team_id = target_team_id
    AND lower(name) = lower(whitelist_entry.full_name);
IF NOT FOUND THEN
INSERT INTO public.players (team_id, name, profile_id, email)
VALUES (
        target_team_id,
        whitelist_entry.full_name,
        new.id,
        new.email
    );
END IF;
-- Caso Dirigente/Staff (como Xavier)
ELSIF (
    whitelist_entry.assigned_role = 'official'
    OR whitelist_entry.assigned_role = 'admin'
)
AND whitelist_entry.assigned_team_name IS NOT NULL THEN
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
-- Caso Oficial de Campo (Veedor/Árbitro) - Sin equipo asignado
ELSIF whitelist_entry.assigned_role = 'official' THEN
INSERT INTO public.officials (id, name, default_role)
VALUES (
        new.id,
        whitelist_entry.full_name,
        'Observer'
    ) ON CONFLICT (id) DO NOTHING;
END IF;
END IF;
END IF;
ELSE -- B. USUARIO DESCONOCIDO (Restringido pero creado)
INSERT INTO public.user_roles (user_id, email, role)
VALUES (new.id, new.email, 'pending') ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.profiles (id, email)
VALUES (new.id, new.email) ON CONFLICT (id) DO NOTHING;
END IF;
RETURN new;
EXCEPTION
WHEN OTHERS THEN -- SI ALGO FALLA, NO BLOQUEAR AL USUARIO
-- Solo creamos el registro base para que pueda entrar como 'pending'
INSERT INTO public.profiles (id, email)
VALUES (new.id, new.email) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_roles (user_id, email, role)
VALUES (new.id, new.email, 'pending') ON CONFLICT (user_id) DO NOTHING;
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- RE-VINCULAR EL TRIGGER (Por si acaso se borró)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_user_verification();