-- FINAL FIX: UNBLOCK REGISTRATION & LOGIN
-- Ejecuta este script para resolver el error de credenciales y el rol 'pending'
-- 1. ABRIR ACCESO A LA WHITELIST (Para que el trigger pueda ver los correos)
DROP POLICY IF EXISTS "Public Read Whitelist" ON public.allowed_users;
CREATE POLICY "Public Read Whitelist" ON public.allowed_users FOR
SELECT USING (true);
-- 2. REPARAR EL PERFIL DE XAVIER (Forzar sincronización)
-- Esto asegura que Xavier tenga el rol 'dirigente' y no 'pending'
SELECT public.repair_user_roles();
-- 3. CAMBIAR CONTRASEÑA DE XAVIER (Manual)
-- Ejecuta esto si Xavier no puede entrar con la clave que recuerda. 
-- Reemplaza 'NUEVA_CLAVE' por la que desees (ej: 'DIRIGENTE')
UPDATE auth.users
SET encrypted_password = crypt('DIRIGENTE', gen_salt('bf'))
WHERE email = 'xavier.intriago@gmail.com';
-- 4. CONFIRMAR EMAIL DE XAVIER (En caso de que Supabase lo esté bloqueando)
UPDATE auth.users
SET email_confirmed_at = NOW(),
    last_sign_in_at = NULL -- Reiniciar sesión
WHERE email = 'xavier.intriago@gmail.com';
-- VERIFICACIÓN
SELECT email,
    role
FROM public.user_roles
WHERE email = 'xavier.intriago@gmail.com';