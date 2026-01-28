-- SCRIPT DE CONFIGURACIÓN DE SUITE DE PRUEBAS
-- Ejecuta este script en el SQL Editor de Supabase para habilitar las cuentas de prueba.
-- 1. Limpiar registros previos de prueba (opcional)
DELETE FROM public.allowed_users
WHERE email IN (
        'test.dirigente@copadelta.com',
        'test.veedor@copadelta.com'
    );
-- 2. Insertar Test Dirigente (Vinculado a Chelsea)
INSERT INTO public.allowed_users (
        email,
        full_name,
        assigned_role,
        assigned_team_name
    )
VALUES (
        'test.dirigente@copadelta.com',
        'Test Dirigente Chelsea',
        'official',
        'Chelsea'
    );
-- 3. Insertar Test Veedor (Sin equipo, rol oficial general)
INSERT INTO public.allowed_users (email, full_name, assigned_role)
VALUES (
        'test.veedor@copadelta.com',
        'Test Veedor Operativo',
        'official'
    );
-- NOTA: Al registrarse con estos correos, el sistema auto-creará:
-- - Dirigente -> Perfil + Rol Official + Registro en team_staff vinculado a Chelsea.
-- - Veedor -> Perfil + Rol Official + Registro en officials como 'Observer'.