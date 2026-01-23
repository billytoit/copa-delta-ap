-- MIGRACIÓN DE DATOS: EQUIPOS Y GRUPOS (VERSIÓN ROBUSTA)
-- Evita el error "no unique constraint matching ON CONFLICT" usando SELECT WHERE NOT EXISTS.
BEGIN;
-- 1. Insertar GRUPOS si no existen
INSERT INTO groups (name)
SELECT 'Grupo A'
WHERE NOT EXISTS (
        SELECT 1
        FROM groups
        WHERE name = 'Grupo A'
    );
INSERT INTO groups (name)
SELECT 'Grupo B'
WHERE NOT EXISTS (
        SELECT 1
        FROM groups
        WHERE name = 'Grupo B'
    );
-- 2. Insertar EQUIPOS si no existen
-- Esta tabla temporal ayuda a insertar masivamente sin repetir lógica
CREATE TEMP TABLE temp_teams (name text, color text) ON COMMIT DROP;
INSERT INTO temp_teams (name, color)
VALUES ('Atlético', '#CB3524'),
    ('Chelsea', '#034694'),
    ('Real Madrid', '#FFFFFF'),
    ('Manchester City', '#6CABDD'),
    ('Al Hilal', '#1E40AF'),
    ('Bayern Múnich', '#DC052D'),
    ('Benfica', '#E81C2E'),
    ('Borussia Dortmund', '#FDE100'),
    ('Inter Miami', '#F4B5CD'),
    ('Inter', '#0068A8'),
    ('Juventus', '#000000'),
    ('León', '#006B3F'),
    ('Los Angeles FC', '#000000'),
    ('Pachuca', '#004A99'),
    ('Porto', '#005CA9'),
    ('Paris Saint-Germain', '#004170'),
    ('Red Bull Salzburg', '#B3012F'),
    ('Seattle', '#5D9741');
INSERT INTO teams (name, color)
SELECT t.name,
    t.color
FROM temp_teams t
WHERE NOT EXISTS (
        SELECT 1
        FROM teams
        WHERE name = t.name
    );
-- 3. Asignar Equipos al GRUPO A
UPDATE teams
SET group_id = (
        SELECT id
        FROM groups
        WHERE name = 'Grupo A'
    )
WHERE name IN (
        'Al Hilal',
        'Bayern Múnich',
        'León',
        'Real Madrid',
        'Borussia Dortmund',
        'Inter Miami',
        'Manchester City',
        'Paris Saint-Germain',
        'Los Angeles FC'
    );
-- 4. Asignar Equipos al GRUPO B
UPDATE teams
SET group_id = (
        SELECT id
        FROM groups
        WHERE name = 'Grupo B'
    )
WHERE name IN (
        'Chelsea',
        'Benfica',
        'Porto',
        'Pachuca',
        'Red Bull Salzburg',
        'Juventus',
        'Seattle',
        'Atlético',
        'Inter'
    );
COMMIT;
-- Verificación Final
SELECT t.name as Team,
    g.name as Group
FROM teams t
    LEFT JOIN groups g ON t.group_id = g.id
ORDER BY g.name NULLS LAST,
    t.name;