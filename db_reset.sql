-- SCRIPT DE RESETEO DE BASE DE DATOS (PARA INICIO DE TORNEO)
-- PRECAUCIÓN: Este script elimina DATOS DE JUEGO (Goles, Tarjetas, Resultados, Votos).
-- NO elimina Equipos, Jugadores ni Usuarios.
BEGIN;
-- 1. Limpiar Eventos de Partido (Goles, Tarjetas, Notas)
DELETE FROM match_events;
-- 2. Limpiar Asignaciones de Árbitros/Veedores
DELETE FROM match_assignments;
-- 3. Resetear Estado de Partidos (Volver a "No Iniciado")
-- Mantiene el calendario (fecha/hora/rivales) pero borra resultados.
UPDATE matches
SET status = 'scheduled',
    started_at = NULL,
    referee_name = NULL,
    referee_id = NULL
WHERE season_id = (
        SELECT id
        FROM seasons
        WHERE is_active = true
    );
-- O quitar el WHERE si se quiere resetear ABSOLUTAMENTE todo.
-- 4. Limpiar Votaciones (Encuestas)
-- Opción A: Borrar votos pero mantener las encuestas activas
DELETE FROM poll_participations;
UPDATE poll_options
SET votes = 0;
-- Opción B: Borrar todas las encuestas (Descomentar si se desea)
-- DELETE FROM polls;
-- 5. Confirmar
-- Si estás ejecutando esto en el Editor SQL de Supabase, el COMMIT es automático al final.
-- Si algo falla, el bloque BEGIN asegura que no se borre nada a medias (en clientes transaccionales).
COMMIT;
-- ESTADÍSTICAS
-- Las vistas como 'view_top_scorers' se actualizarán automáticamente al estar vacía la tabla match_events.