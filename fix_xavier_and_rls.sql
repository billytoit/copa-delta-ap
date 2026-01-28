-- 1. AGREGAR A XAVIER A LA WHITELIST (Allowed Users)
-- Esto permite que el sistema lo reconozca al registrarse y lo vincule con su equipo.
INSERT INTO public.allowed_users (
        email,
        full_name,
        assigned_role,
        assigned_team_name
    )
VALUES (
        'xavier.intriago@gmail.com',
        'Xavier Intriago',
        'official',
        'Atlético' -- Asumiendo que Equipo ID 1 es Atlético basado en los logs previos.
    ) ON CONFLICT (email) DO
UPDATE
SET full_name = EXCLUDED.full_name,
    assigned_role = EXCLUDED.assigned_role,
    assigned_team_name = EXCLUDED.assigned_team_name;
-- 2. ASEGURAR POLÍTICAS DE ACTUALIZACIÓN (RLS)
-- Estas políticas permiten que cada usuario pueda editar sus propios datos.
-- Para la tabla de Perfiles (profiles)
DROP POLICY IF EXISTS "Users Update Own Profile" ON public.profiles;
CREATE POLICY "Users Update Own Profile" ON public.profiles FOR
UPDATE USING (auth.uid() = id);
-- Para la tabla de Cuerpo Técnico (team_staff)
-- Un dirigente puede editar su propia información si está vinculado a su cuenta de Auth
DROP POLICY IF EXISTS "Users Update Own Staff Record" ON public.team_staff;
CREATE POLICY "Users Update Own Staff Record" ON public.team_staff FOR
UPDATE USING (auth.uid() = profile_id);
-- Para la tabla de Jugadores (players)
-- Un jugador puede editar su propia información si está vinculado a su cuenta de Auth
DROP POLICY IF EXISTS "Users Update Own Player Record" ON public.players;
CREATE POLICY "Users Update Own Player Record" ON public.players FOR
UPDATE USING (auth.uid() = profile_id);
-- 3. HABILITAR RLS (Por si acaso no están activadas)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
-- 4. VINCULACIÓN MANUAL (Opcional - por si Xavier ya se registró antes de ser whitelisted)
-- Si Xavier ya tiene un ID de Auth, este update lo vincula inmediatamente.
UPDATE public.team_staff
SET profile_id = p.id
FROM public.profiles p
WHERE public.team_staff.email = p.email
    AND p.email = 'xavier.intriago@gmail.com';