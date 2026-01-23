-- DIAGNOSTIC: DEEP DIVE INTO USER ROLES
-- Vamos a ver EXACTAMENTE qué tiene la base de datos para este email.
SELECT id,
    user_id,
    email,
    role,
    created_at
FROM public.user_roles
WHERE email ILIKE '%lovocomunicaciones%';
-- ILIKE para ignorar mayúsculas/minúsculas
-- También verificar si hay multiples usuarios en auth con ese mail (raro pero posible)
SELECT id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE email ILIKE '%lovocomunicaciones%';