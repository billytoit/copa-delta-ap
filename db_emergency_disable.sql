-- EMERGENCY FIX: KILL THE TRIGGER
-- El trigger está fallando de una manera que bloquea todo el registro.
-- Vamos a eliminarlo para que puedas entrar, y luego asignamos tu rol manualmente.
-- 1. Eliminar el trigger problemático
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_user_verification;
-- 2. Limpiar intentos fallidos previos (por si acaso quedó "basura" en la BD)
-- (Opcional, pero bueno para asegurar limpieza)
DELETE FROM public.user_roles
WHERE email = 'lovocomunicaciones@gmail.com';
DELETE FROM public.profiles
WHERE email = 'lovocomunicaciones@gmail.com';
-- Ahora intenta registrarte en el App.
-- Entrarás, pero verás la pantalla "Restringida".
-- LUEGO de entrar, corre el paso 3 abajo:
-- 3. Asignar Admin Manualmente (CORRER DESPUÉS DE REGISTRARSE)
/*
 INSERT INTO public.user_roles (user_id, email, role)
 SELECT id, email, 'admin'
 FROM auth.users
 WHERE email = 'lovocomunicaciones@gmail.com'
 ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
 
 INSERT INTO public.profiles (id, email, full_name)
 SELECT id, email, 'Admin Principal'
 FROM auth.users
 WHERE email = 'lovocomunicaciones@gmail.com'
 ON CONFLICT (id) DO NOTHING;
 */