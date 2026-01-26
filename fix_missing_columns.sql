-- SCRIPT PARA AGREGAR COLUMNAS FALTANTES
-- Ejecuta esto en tu SQL Editor de Supabase
-- 1. Agregar columnas a players (Jugadores)
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS job TEXT,
    ADD COLUMN IF NOT EXISTS instagram TEXT;
-- 2. Agregar columnas a team_staff (Dirigentes/Cuerpo Técnico)
ALTER TABLE public.team_staff
ADD COLUMN IF NOT EXISTS nickname TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS job TEXT,
    ADD COLUMN IF NOT EXISTS instagram TEXT;
-- 3. Asegurar columnas en profiles (Perfiles de Usuario)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS job TEXT,
    ADD COLUMN IF NOT EXISTS instagram TEXT;
-- 4. Asegurar que las políticas RLS permitan estas actualizaciones
-- (Asumiendo que las políticas existentes usan 'ALL' o que están bien configuradas)