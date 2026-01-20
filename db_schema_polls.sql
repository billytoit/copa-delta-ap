-- Tablas para el Sistema de Votaciones (Copa Delta)
-- 1. Tabla de Encuestas (Polls)
create table if not exists polls (
    id bigint primary key generated always as identity,
    title text not null,
    description text,
    status text not null default 'open',
    created_at timestamptz default now()
);
-- 2. Tabla de Opciones de Encuesta (Poll Options)
-- Se almacenan las opciones y el conteo de votos.
create table if not exists poll_options (
    id bigint primary key generated always as identity,
    poll_id bigint references polls(id) on delete cascade not null,
    label text not null,
    votes integer default 0
);
-- 3. Tabla de Participación (Poll Participations)
-- Registra QUE un usuario votó en una encuesta, pero NO qué opción eligió.
-- Esto garantiza el anonimato del voto (no se puede vincular usuario -> opción)
-- pero previene el doble voto.
create table if not exists poll_participations (
    poll_id bigint references polls(id) on delete cascade not null,
    user_id text not null,
    -- Puede ser UUID de auth o ID string de nuestros datos mock
    created_at timestamptz default now(),
    primary key (poll_id, user_id)
);
-- Políticas RLS (Row Level Security) - Opcional para demo local pero recomendado
alter table polls enable row level security;
alter table poll_options enable row level security;
alter table poll_participations enable row level security;
-- Política simple: Todos pueden leer encuestas
create policy "Public polls are viewable by everyone" on polls for
select using (true);
create policy "Public options are viewable by everyone" on poll_options for
select using (true);
create policy "Public participations are viewable by everyone" on poll_participations for
select using (true);
-- Política: Todos pueden insertar (para demo, idealmente solo admin crea polls)
create policy "Anyone can insert polls" on polls for
insert with check (true);
create policy "Anyone can insert options" on poll_options for
insert with check (true);
create policy "Anyone can insert participations" on poll_participations for
insert with check (true);
-- Política: Modificaciones (Votos e Incrementar contadores)
create policy "Anyone can update options (vote)" on poll_options for
update using (true);
create policy "Anyone can update polls (close)" on polls for
update using (true);