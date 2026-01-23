-- SOLUCION DEFINITIVA PARA BHIGGINS
-- Este script hace 2 cosas:
-- 1. Abre los permisos de la tabla (RLS)
-- 2. FUERZA la conexión entre tu Usuario y el Jugador "Billy" en el equipo "Atlético"
-- PASO 1: ARREGLAR PERMISOS (Para que la app pueda leer)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Players" ON players;
DROP POLICY IF EXISTS "Authenticated Read Players" ON players;
CREATE POLICY "Public Read Players" ON players FOR
SELECT USING (true);
-- PASO 2: FORZAR DATOS (Conectar tu usuario al equipo)
DO $$
DECLARE my_user_id UUID;
my_team_id INT;
BEGIN -- 1. Buscar tu ID de usuario real
SELECT id INTO my_user_id
FROM auth.users
WHERE email = 'bhiggins.p@gmail.com';
-- 2. Buscar el ID del equipo 'Atlético' (ajustar si se llama diferente)
SELECT id INTO my_team_id
FROM teams
WHERE name ILIKE '%Atlético%'
LIMIT 1;
-- 3. Verificar que encontramos usuario y equipo
IF my_user_id IS NULL THEN RAISE NOTICE '❌ ERROR: No se encontró el usuario bhiggins.p@gmail.com';
RETURN;
END IF;
IF my_team_id IS NULL THEN RAISE NOTICE '❌ ERROR: No se encontró el equipo Atlético';
RETURN;
END IF;
-- 4. Actualizar o Crear el registro en PLAYERS
-- Primero intentamos actualizar si ya existe por email o nombre
UPDATE players
SET profile_id = my_user_id,
    team_id = my_team_id,
    email = 'bhiggins.p@gmail.com'
WHERE email = 'bhiggins.p@gmail.com'
    OR name ILIKE '%Higgins%';
-- Si no existía, lo creamos de cero
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
        'bhiggins.p@gmail.com',
        my_user_id,
        my_team_id,
        10
    );
RAISE NOTICE '✅ JUGADOR CREADO Y VINCULADO CORRECTAMENTE';
ELSE RAISE NOTICE '✅ JUGADOR EXISTENTE ACTUALIZADO Y VINCULADO';
END IF;
END $$;