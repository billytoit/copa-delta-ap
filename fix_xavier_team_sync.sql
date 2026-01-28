-- FINAL TEAM SYNC FIX
-- Vincular a Xavier Intriago con su equipo (Atlético) en team_staff
DO $$
DECLARE xavier_id UUID;
BEGIN -- 1. Obtener el ID real de Xavier desde profiles
SELECT id INTO xavier_id
FROM public.profiles
WHERE email = 'xavier.intriago@gmail.com';
IF xavier_id IS NOT NULL THEN -- 2. Vincular el profile_id en team_staff
UPDATE public.team_staff
SET profile_id = xavier_id,
    role = 'Dirigente' -- Asegurar mayúscula para visual pero el rol de user_roles será minúscula
WHERE email = 'xavier.intriago@gmail.com';
-- 3. Asegurar que en user_roles tenga el rol correcto
UPDATE public.user_roles
SET role = 'dirigente'
WHERE user_id = xavier_id;
RAISE NOTICE 'Xavi vinculado con éxito al ID %',
xavier_id;
ELSE RAISE EXCEPTION 'No se encontró el perfil de Xavier. ¿Ya se registró?';
END IF;
END $$;
-- VERIFICACIÓN
SELECT s.name,
    s.email,
    t.name as equipo,
    r.role
FROM public.team_staff s
    JOIN public.teams t ON s.team_id = t.id
    JOIN public.user_roles r ON s.email = r.email
WHERE s.email = 'xavier.intriago@gmail.com';