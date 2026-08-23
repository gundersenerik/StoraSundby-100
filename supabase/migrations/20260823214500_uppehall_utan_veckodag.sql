-- ═══════════════════════════════════════════════════════════════════════════
--  Migration 003 — samma regel, även för veckodag
-- ═══════════════════════════════════════════════════════════════════════════
--
--  Migration 002 gjorde tiderna valfria för ett pausat pass. Den missade att
--  veckodagen har exakt samma problem: startsidan skriver "Bollek från 2022:
--  Uppehåll" utan att ange vare sig dag eller tid.
--
--  Att gissa en veckodag vore att hitta på ett faktum. Regeln utvidgas i
--  stället: veckodag krävs, utom när passet är pausat.
--
--  Att detta blev en egen migration i stället för en del av 002 är en följd
--  av att felet upptäcktes ett steg senare, när datan faktiskt skulle in.
--  Migrationer skrivs inte om i efterhand — historiken ska visa vad som
--  hände, inte vad som borde ha hänt.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.training_sessions
  alter column weekday drop not null;

alter table public.training_sessions
  drop constraint tider_kravs_om_aktiv;

alter table public.training_sessions
  add constraint tider_kravs_om_aktiv
    check (
      status = 'uppehall'
      or (weekday is not null and starts_at is not null and ends_at is not null)
    );

comment on constraint tider_kravs_om_aktiv on public.training_sessions is
  'Ett aktivt eller installt pass maste ha veckodag och tider. Ett pausat pass far sakna dem.';
