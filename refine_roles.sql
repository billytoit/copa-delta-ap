-- SCRIPT DE REFINAMIENTO DE ROLES (Veedor vs Dirigente)
-- 1. Actualización de la Whitelist (allowed_users)
-- Cambiamos el concepto de 'official' genérico por roles específicos
UPDATE public.allowed_users
SET assigned_role = 'dirigente'
WHERE assigned_role = 'official'
    AND assigned_team_name IS NOT NULL;
UPDATE public.allowed_users
SET assigned_role = 'veedor'
WHERE assigned_role = 'official'
    AND assigned_team_name IS NULL;
-- Aseguramos que Xavier sea Dirigente (ya que tiene equipo 'Atlético')
UPDATE public.allowed_users
SET assigned_role = 'dirigente'
WHERE email = 'xavier.intriago@gmail.com';
-- 2. Función de Verificación Actualizada
CREATE OR REPLACE FUNCTION public.handle_user_verification() RETURNS trigger AS $$
DECLARE whitelist_entry record;
DECLARE target_team_id bigint;
BEGIN -- Buscar en whitelist (Insensible a mayúsculas)
SELECT * INTO whitelist_entry
FROM public.allowed_users
WHERE lower(email) = lower(new.email);
IF whitelist_entry IS NOT NULL THEN -- A. Crear/Actualizar Perfil
INSERT INTO public.profiles (id, email, full_name)
VALUES (new.id, new.email, whitelist_entry.full_name) ON CONFLICT (id) DO
UPDATE
SET full_name = EXCLUDED.full_name;
-- B. Asignar Rol Específico
INSERT INTO public.user_roles (user_id, email, role)
VALUES (
        new.id,
        new.email,
        COALESCE(whitelist_entry.assigned_role, 'fan')
    ) ON CONFLICT (user_id) DO
UPDATE
SET role = EXCLUDED.role;
-- C. Lógica de Vinculación según el Rol
IF whitelist_entry.assigned_role = 'dirigente'
AND whitelist_entry.assigned_team_name IS NOT NULL THEN -- Buscar el ID del equipo
SELECT id INTO target_team_id
FROM public.teams
WHERE lower(name) = lower(whitelist_entry.assigned_team_name)
LIMIT 1;
IF target_team_id IS NOT NULL THEN -- Insertar en team_staff como Dirigente
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
ELSIF whitelist_entry.assigned_role = 'veedor' THEN -- Insertar en officials (Veedores operativos)
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 3. REPARACIÓN DE USUARIOS EXISTENTES
-- Función para reparar un usuario específico
CREATE OR REPLACE FUNCTION public.repair_user_roles() RETURNS void AS $$
DECLARE user_rec record;
BEGIN FOR user_rec IN
SELECT id,
    email
FROM auth.users LOOP PERFORM public.handle_user_verification_by_id(user_rec.id, user_rec.email);
END LOOP;
END;
$$ LANGUAGE plpgsql;
-- Helper para la reparación por ID
CREATE OR REPLACE FUNCTION public.handle_user_verification_by_id(uid uuid, uemail text) RETURNS void AS $$
DECLARE whitelist_entry record;
DECLARE target_team_id bigint;
BEGIN
SELECT * INTO whitelist_entry
FROM public.allowed_users
WHERE lower(email) = lower(uemail);
IF whitelist_entry IS NOT NULL THEN -- Actualizar Rol
INSERT INTO public.user_roles (user_id, email, role)
VALUES (uid, uemail, whitelist_entry.assigned_role) ON CONFLICT (user_id) DO
UPDATE
SET role = EXCLUDED.role;
-- Vincular Staff
IF whitelist_entry.assigned_role = 'dirigente'
AND whitelist_entry.assigned_team_name IS NOT NULL THEN
SELECT id INTO target_team_id
FROM public.teams
WHERE lower(name) = lower(whitelist_entry.assigned_team_name)
LIMIT 1;
IF target_team_id IS NOT NULL THEN
INSERT INTO public.team_staff (team_id, profile_id, name, email, role)
VALUES (
        target_team_id,
        uid,
        whitelist_entry.full_name,
        uemail,
        'Dirigente'
    ) ON CONFLICT (email) DO
UPDATE
SET profile_id = EXCLUDED.profile_id,
    team_id = EXCLUDED.team_id;
END IF;
-- Vincular Veedor
ELSIF whitelist_entry.assigned_role = 'veedor' THEN
INSERT INTO public.officials (id, name, default_role)
VALUES (uid, whitelist_entry.full_name, 'Observer') ON CONFLICT (id) DO NOTHING;
END IF;
END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Ejecutar reparación
SELECT public.repair_user_roles();