-- Vista para calcular goleadores en el servidor (Performance)
create or replace view view_top_scorers as
select
    p.id as player_id,
    p.name,
    p.nickname,
    p.photo_url,
    t.name as team_name,
    t.color as team_color,
    t.id as team_id,
    m.season_id,
    count(me.id) as goals
from
    match_events me
    join players p on me.player_id = p.id
    left join teams t on p.team_id = t.id
    join matches m on me.match_id = m.id
where
    me.event_type = 'goal'
group by
    p.id, p.name, p.nickname, p.photo_url, t.name, t.color, t.id, m.season_id;
