-- ═══════════════════════════════════════════════════════════════════════════
--  Migration 002 — ett pass på uppehåll behöver inga tider
-- ═══════════════════════════════════════════════════════════════════════════
--
--  Upptäckt när riktig data från gamla sajten skulle läggas in.
--
--  Startsidan listar "Bollek från 2022: Uppehåll" och "Orientering: Uppehåll"
--  helt utan klockslag. Med `starts_at not null` gick de inte att lägga in
--  alls, och hade därmed försvunnit från schemat — precis det kontraktet
--  säger inte får hända. Ett pausat pass ska visas som pausat.
--
--  Lösningen är inte att bara ta bort not null. Då hade ett AKTIVT pass
--  kunnat sakna tider, och det vore ett trasigt schema. Villkoret flyttas
--  i stället till statusen: tider krävs, utom när passet är pausat.
--
--  Notera hur valid_period skrivs. En jämförelse där någon sida är NULL ger
--  NULL, vilket en CHECK behandlar som uppfylld — villkoret hoppas alltså
--  över tyst i stället för att avvisa. Det är samma fälla som gäller
--  exclusion constraints på bokningar. Här är det ofarligt eftersom
--  tider_kravs_om_aktiv redan garanterar att båda finns när det spelar roll.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.training_sessions
  alter column starts_at drop not null,
  alter column ends_at   drop not null;

alter table public.training_sessions
  drop constraint valid_period;

alter table public.training_sessions
  add constraint valid_period
    check (starts_at is null or ends_at is null or ends_at > starts_at);

alter table public.training_sessions
  add constraint tider_kravs_om_aktiv
    check (
      status = 'uppehall'
      or (starts_at is not null and ends_at is not null)
    );

comment on constraint tider_kravs_om_aktiv on public.training_sessions is
  'Ett aktivt eller installt pass maste ha tider. Ett pausat pass far sakna dem.';
