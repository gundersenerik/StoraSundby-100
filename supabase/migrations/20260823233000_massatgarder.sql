-- ═══════════════════════════════════════════════════════════════════════════
--  Migration 006 — massåtgärder på schemat
-- ═══════════════════════════════════════════════════════════════════════════
--
--  De tre åtgärder som faktiskt behövs i verkligheten enligt prompten:
--  flytta en hel grupp en timme, pausa en grupp för säsongen, och kopiera
--  hela schemat till nästa säsong.
--
--  De ligger i databasen och inte i klienten eftersom de är atomära. Att
--  hämta tjugo rader, räkna om dem i JavaScript och skriva tillbaka dem en
--  och en ger halvfärdiga scheman om något går fel på rad tolv.
--
--  SECURITY INVOKER, inte definer. Funktionerna körs med anroparens
--  rättigheter, så RLS gäller precis som vanligt: en icke-administratör får
--  noll rader uppdaterade. En security definer-funktion här hade varit en
--  bakdörr förbi hela behörighetsmodellen.
--
--  Tidsaritmetik med `time` wrappar runt midnatt: 23.30 plus en timme blir
--  00.30. Då blir sluttiden före starttiden och valid_period avvisar hela
--  uppdateringen. Det är rätt beteende — hellre att ingenting händer än att
--  halva schemat hamnar på fel dygn.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.flytta_sektion(
  p_sektion  text,
  p_sasong   text,
  p_minuter  integer
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  antal integer;
begin
  update public.training_sessions
  set starts_at = starts_at + make_interval(mins => p_minuter),
      ends_at   = ends_at   + make_interval(mins => p_minuter)
  where section_slug = p_sektion
    and season = p_sasong
    and starts_at is not null
    and ends_at is not null;

  get diagnostics antal = row_count;
  return antal;
end;
$$;

comment on function public.flytta_sektion is
  'Flyttar alla pass i en sektion ett antal minuter. Pausade pass utan tider ror sig inte.';

create or replace function public.pausa_sektion(
  p_sektion text,
  p_sasong  text,
  p_pausa   boolean
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  antal integer;
begin
  update public.training_sessions
  set status = case when p_pausa then 'uppehall'::public.training_status
                    else 'aktiv'::public.training_status end
  where section_slug = p_sektion
    and season = p_sasong
    -- Att aterstarta ett pass som saknar tider skulle bryta mot
    -- tider_kravs_om_aktiv. Lat det ligga kvar pa uppehall.
    and (p_pausa or (weekday is not null and starts_at is not null and ends_at is not null));

  get diagnostics antal = row_count;
  return antal;
end;
$$;

comment on function public.pausa_sektion is
  'Pausar eller aterstartar en hel sektion. Pass utan tider aterstartas inte.';

create or replace function public.kopiera_sasong(
  p_fran text,
  p_till text
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  antal integer;
begin
  if p_fran = p_till then
    raise exception 'Kallsasong och malsasong ar samma: %', p_fran;
  end if;

  if exists (select 1 from public.training_sessions where season = p_till) then
    raise exception 'Sasongen % innehaller redan pass. Tom den forst.', p_till;
  end if;

  insert into public.training_sessions
    (section_slug, grupp, age_from, age_to, weekday, starts_at, ends_at,
     place, season, status, note, sort_order)
  select
    section_slug, grupp, age_from, age_to, weekday, starts_at, ends_at,
    place, p_till, status, note, sort_order
  from public.training_sessions
  where season = p_fran;

  get diagnostics antal = row_count;
  return antal;
end;
$$;

comment on function public.kopiera_sasong is
  'Kopierar hela schemat till en ny sasong. Vagrar skriva over en sasong som redan har pass.';
