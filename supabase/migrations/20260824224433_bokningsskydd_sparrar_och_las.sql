-- ═══════════════════════════════════════════════════════════════════════════
--  Migration 009 — tre hål som granskningen hittade i bokningsskyddet
-- ═══════════════════════════════════════════════════════════════════════════
--
--  1. ANON KUNDE SÄTTA PRISET. INSERT-rättigheten var tabellbred, så en
--     POST direkt mot REST-API:et kunde sätta estimated_price — som sedan
--     hade flutit rakt in i bekräftelsemejlets betalinstruktion — och
--     förstämpla paminnelse_skickad_at så att påminnelsen aldrig gick ut.
--     Nu får anon skriva exakt formulärets kolumner, ingenting annat.
--     Priset sätts från och med nu av kansliets bekräftelse, inte av den
--     som frågar.
--
--  2. SPÄRRAR DELTOG INTE I SKYDDET. Exclusion-constrainten och triggern
--     läste bara bookings, så en bokning kunde bekräftas rakt över en
--     period kansliet spärrat — samtidigt som admin-gränssnittets
--     felmeddelande påstod att spärrar gav konflikt. Nu kontrollerar
--     triggern även booking_blocks: en spärr på en stuga stoppar stugan
--     och hela anläggningen, en spärr på hela anläggningen stoppar allt.
--
--  3. KORSÖVERLAPPET VAR RACIGT. Två samtidiga transaktioner — en stuga
--     och hela anläggningen för samma helg — har olika objektnycklar, så
--     exclusion-constrainten serialiserar dem inte, och en vanlig SELECT
--     ser inte den andras ocommittade rad. Båda kunde bekräftas. Triggern
--     tar nu ett rådgivande transaktionslås innan den kontrollerar, så
--     blockerande skrivningar radas upp och den andra ser den förstas
--     committade rad. Låset är grovt — ett för alla bokningar — men
--     föreningen bekräftar bokningar i handvändningstakt, inte i tusental.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Kolumnvis INSERT ─────────────────────────────────────────────────
revoke insert on public.bookings from anon, authenticated;
grant insert (
  cabin_id, starts_at, ends_at, party_size, bringing_dog, purpose,
  contact_name, contact_email, contact_phone, message
) on public.bookings to anon, authenticated;

-- Administratörer skriver via UPDATE-policyn och påverkas inte: priset och
-- påminnelsestämpeln är från och med nu deras kolumner.

-- ─── 2 och 3. Triggern: spärrar och låsning ──────────────────────────────
create or replace function public.kontrollera_korsoverlapp()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  ny_period tstzrange;
begin
  if new.status not in ('bekraftad', 'betald') then
    return new;
  end if;

  -- Ogiltig period släpps vidare till valid_period, som ger ett begripligt
  -- fel. tstzrange här hade kastat 22000 i stället.
  if new.ends_at <= new.starts_at then
    return new;
  end if;

  -- Serialisera blockerande skrivningar. Utan låset ser två samtidiga
  -- transaktioner inte varandras ocommittade rader, och en stuga plus hela
  -- anläggningen kunde bekräftas för samma helg.
  perform pg_advisory_xact_lock(hashtext('bookings_korsoverlapp'));

  ny_period := tstzrange(new.starts_at, new.ends_at, '[)');

  -- Spärrade perioder: en spärr på hela anläggningen stoppar allt, en
  -- spärr på en stuga stoppar stugan och hela anläggningen.
  if exists (
    select 1 from public.booking_blocks bl
    where (bl.cabin_id is null
           or new.cabin_id is null
           or bl.cabin_id = new.cabin_id)
      and tstzrange(bl.starts_at, bl.ends_at, '[)') && ny_period
  ) then
    raise exception 'Perioden ar sparrad av kansliet'
      using errcode = '23P01';
  end if;

  if new.cabin_id is null then
    if exists (
      select 1 from public.bookings b
      where b.id <> new.id
        and b.cabin_id is not null
        and b.status in ('bekraftad', 'betald')
        and tstzrange(b.starts_at, b.ends_at, '[)') && ny_period
    ) then
      raise exception 'Hela anlaggningen kan inte bokas: en stuga ar redan bokad under perioden'
        using errcode = '23P01';
    end if;
  else
    if exists (
      select 1 from public.bookings b
      where b.id <> new.id
        and b.cabin_id is null
        and b.status in ('bekraftad', 'betald')
        and tstzrange(b.starts_at, b.ends_at, '[)') && ny_period
    ) then
      raise exception 'Stugan kan inte bokas: hela anlaggningen ar bokad under perioden'
        using errcode = '23P01';
    end if;
  end if;

  return new;
end;
$$;

-- Fortfarande utom räckhåll för REST-API:et (migration 008).
revoke all on function public.kontrollera_korsoverlapp() from public, anon, authenticated;
