-- SOLUCIÓN COMPLETA (CORREGIDA)
-- Eliminada la referencia a la columna 'role' en profiles que causaba error.
DO $$
DECLARE my_user_id UUID;
my_email TEXT := 'bhiggins.p@gmail.com';
my_team_id INT;
BEGIN -- 1. Buscar ID de Auth
SELECT id INTO my_user_id
FROM auth.users
WHERE email = my_email;
IF my_user_id IS NULL THEN RAISE NOTICE '⚠️ Usuario no encontrado en Auth (Login primero).';
RETURN;
END IF;
-- 2. Crear el Perfil (Sin columna role, que estaba mal)
INSERT INTO public.profiles (id, full_name, email)
VALUES (my_user_id, 'Billy Higgins', my_email) ON CONFLICT (id) DO
UPDATE
SET full_name = 'Billy Higgins';
-- 2b. Asignar Rol en la tabla correcta (user_roles)
-- Aseguramos que tengas rol de admin/player para ver todo
INSERT INTO public.user_roles (user_id, role)
VALUES (my_user_id, 'admin') ON CONFLICT (user_id) DO NOTHING;
-- 3. Buscar el ID del equipo 'Atlético'
SELECT id INTO my_team_id
FROM teams
WHERE name ILIKE '%Atlético%'
LIMIT 1;
-- 4. Vincular o Crear Jugador
-- Intentar actualizar existente
UPDATE players
SET profile_id = my_user_id,
    team_id = my_team_id,
    email = my_email
WHERE email = my_email
    OR name ILIKE '%Higgins%';
-- Si no se actualizó ninguno, crear uno nuevo
IF NOT FOUND THEN
INSERT INTO players (
        name,
        nickname,
        email,
        profile_id,
        team_id,
        number
    )
VALUES (
        'Billy Higgins',
        'Billy',
        my_email,
        my_user_id,
        my_team_id,
        10
    );
END IF;
RAISE NOTICE '✅ ÉXITO: Perfil y Rol verificados, Jugador vinculado.';
END $$;
-- PARTE 2: Asegurar Permisos (RLS)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Players" ON players;
CREATE POLICY "Public Read Players" ON players FOR
SELECT USING (true);