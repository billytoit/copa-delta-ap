-- SCRIPT DE LIMPIEZA PROFUNDA (Copa Delta)
-- Ejecuta esto si Supabase da error al borrar un usuario manualmente.
-- Esto eliminará los vínculos en las tablas públicas para que el borrado en Auth sea posible.
DO $$
DECLARE test_email_1 TEXT := 'test.dirigente@copadelta.com';
test_email_2 TEXT := 'test.veedor@copadelta.com';
BEGIN -- 1. Eliminar de tablas de juego/staff
DELETE FROM public.team_staff
WHERE email IN (test_email_1, test_email_2);
-- 2. Eliminar de roles y perfiles usando el email
-- Nota: Eliminamos primero de user_roles y profiles para romper el vínculo con auth.users
DELETE FROM public.user_roles
WHERE email IN (test_email_1, test_email_2);
-- Para profiles y officials, necesitamos buscar por email ya que el ID es el del Auth
DELETE FROM public.profiles
WHERE email IN (test_email_1, test_email_2);
-- Borrado de oficiales (por si se creó por ID)
-- Si no sabemos el ID, el borrado anterior de perfiles/roles suele ser suficiente 
-- para que la interfaz de Supabase deje de dar el error de llave foránea.
RAISE NOTICE 'Limpieza de tablas públicas completada para % y %',
test_email_1,
test_email_2;
END $$;