-- ☢️ OPCIÓN NUCLEAR: BORRÓN Y CUENTA NUEVA ☢️
-- Ejecuta esto SOLO si prefieres borrar todos los datos antiguos y empezar limpio.
-- 1. Limpiar tablas de jugadores y lista blanca
TRUNCATE TABLE players CASCADE;
TRUNCATE TABLE allowed_users CASCADE;
-- 2. Eliminar la tabla temporal que causa confusión
DROP TABLE IF EXISTS "players_import";
-- 3. Asegurar que los permisos queden bien para el futuro
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Players" ON players;
CREATE POLICY "Public Read Players" ON players FOR
SELECT USING (true);
-- ✅ LISTO.
-- Ahora tu base de datos está limpia de jugadores.
-- PASO SIGUIENTE: Sube tu CSV actualizado a la tabla 'allowed_users'.