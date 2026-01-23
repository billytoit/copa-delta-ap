-- FORCE ADMIN ROLE
-- Ejecuta esto para asegurar que tu usuario sea Admin, sin importar qué pasó antes.
UPDATE public.user_roles
SET role = 'admin'
WHERE email = 'lovocomunicaciones@gmail.com';
-- Verificar qué rol tiene ahora
SELECT *
FROM public.user_roles
WHERE email = 'lovocomunicaciones@gmail.com';