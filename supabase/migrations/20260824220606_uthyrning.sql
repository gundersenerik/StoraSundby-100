-- ═══════════════════════════════════════════════════════════════════════════
--  Migration 007 — uthyrning: stugor, bokningar och spärrar
-- ═══════════════════════════════════════════════════════════════════════════
--
--  DUBBELBOKNINGSSKYDDET BOR HÄR, INTE I APPLIKATIONEN. Två samtidiga
--  förfrågningar om samma helg ska avgöras av databasen: en vinner, en
--  avvisas med 23P01. En kontroll i en server action är ett lager som kan
--  glömmas vid nästa action — exclusion-constrainten kan inte det.
--
--  BOKNINGAR ÄR HÄNDELSER I TIDEN och lagras som timestamptz i UTC, till
--  skillnad från träningstider som är väggklockstider (migration 001).
--  En bokning över sommartidsskiftet ska vara samma antal kalendernätter.
--
--  NULL-FÄLLAN: en jämförelse med NULL ger NULL, som en CHECK behandlar som
--  uppfylld och som gör ett tstzrange till NULL — då hoppar exclusion-
--  constrainten över raden tyst. Därför NOT NULL på båda tidkolumnerna.
--  Fällan är dokumenterad i CLAUDE.md och bevisas i tests/db/.
--
--  FÖRFRÅGAN, INTE DIREKTBOKNING. Kansliet är volontärer, så flödet är
--  förfrågan → bekräftad → betald → genomförd. Bara bekräftad och betald
--  blockerar kalendern: en förfrågan får inte kunna spärra en helg genom
--  att bara skickas in. Direktbokning kan slås på senare utan omskrivning
--  eftersom det bara är en statusövergång som i så fall automatiseras.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists btree_gist;

-- ─── Stugorna ────────────────────────────────────────────────────────────
-- Antal och namn är obekräftade (B3 i TILL-KLUBBEN) och seedas därför som
-- data, inte som schema. dog_friendly är null tills kansliet sagt vilken
-- stuga som tillåter hund — webbplatsen säger bara att en av dem gör det.
create table public.cabins (
  id           text primary key,
  namn         text not null,
  beds         integer not null check (beds > 0),
  dog_friendly boolean,
  description  text,
  sort_order   integer not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.cabins is
  'Uthyrningsobjekten. Antal och namn ar obekraftade och bor i seed, inte i schema.';

create trigger cabins_set_updated_at
  before update on public.cabins
  for each row execute function public.set_updated_at();

-- ─── Bokningar ───────────────────────────────────────────────────────────
create type public.booking_status as enum
  ('forfragan', 'bekraftad', 'betald', 'genomford', 'avbojd', 'avbokad');

create type public.booking_purpose as enum
  ('overnattning', 'fest', 'lager', 'annat');

create table public.bookings (
  id             uuid primary key default gen_random_uuid(),

  -- null = hela anläggningen. Kolliderar då med varje enskild stuga,
  -- vilket vaktas av triggern längre ner.
  cabin_id       text references public.cabins(id),

  starts_at      timestamptz not null,
  ends_at        timestamptz not null,

  party_size     integer not null check (party_size between 1 and 200),
  bringing_dog   boolean not null default false,
  purpose        public.booking_purpose not null,

  contact_name   text not null check (char_length(contact_name) between 1 and 200),
  contact_email  text not null check (contact_email like '%_@_%' and char_length(contact_email) <= 320),
  contact_phone  text check (char_length(contact_phone) <= 40),
  message        text check (char_length(message) <= 4000),

  -- Sätts av servern när priserna inte längre är platshållare. Null betyder
  -- att kansliet återkommer med pris — aldrig att det är gratis.
  estimated_price integer check (estimated_price >= 0),

  status         public.booking_status not null default 'forfragan',

  -- Idempotens för påminnelsemejlet: cron-rutten kör dagligen och får
  -- aldrig skicka två påminnelser för samma bokning.
  paminnelse_skickad_at timestamptz,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  -- tstzrange kastar 22000 om slut ligger före start. CHECK-en ger ett fel
  -- som går att översätta till något en människa förstår.
  constraint valid_period check (ends_at > starts_at)
);

comment on column public.bookings.starts_at is
  'Tidpunkt i UTC, till skillnad fran traningstider som ar vaggklockstider.';

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- Objektnyckel för överlappskontrollen. Exclusion jämför med =, och
-- null = null är aldrig sant — utan den här kolumnen hade två bokningar av
-- hela anläggningen aldrig kolliderat med varandra.
alter table public.bookings add column object_key text
  generated always as (coalesce(cabin_id, 'hela-anlaggningen')) stored;

-- Själva skyddet. Halvöppet intervall [) så att avresedag och ankomstdag
-- får dela datum. Bara bekräftade och betalda bokningar blockerar.
alter table public.bookings add constraint bookings_no_overlap
  exclude using gist (
    object_key with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('bekraftad', 'betald'));

create index bookings_status_idx on public.bookings (status);
create index bookings_starts_at_idx on public.bookings (starts_at);

-- ─── Korsöverlapp: hela anläggningen mot enskild stuga ───────────────────
-- Exclusion-constrainten jämför bara lika objektnycklar. Att hela
-- anläggningen krockar med varje stuga, och tvärtom, vaktas av en trigger —
-- fortfarande i databasen, inte i appen.
--
-- SECURITY DEFINER av nödvändighet: triggern läser bookings, och den som
-- skickar en förfrågan är anonym utan läsrätt på tabellen. Med invoker hade
-- RLS gömt alla rader för kontrollen, som då alltid sagt ja.
create or replace function public.kontrollera_korsoverlapp()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status not in ('bekraftad', 'betald') then
    return new;
  end if;

  -- Ogiltig period släpps vidare till valid_period, som ger ett begripligt
  -- fel. tstzrange här hade kastat 22000 i stället.
  if new.ends_at <= new.starts_at then
    return new;
  end if;

  if new.cabin_id is null then
    if exists (
      select 1 from public.bookings b
      where b.id <> new.id
        and b.cabin_id is not null
        and b.status in ('bekraftad', 'betald')
        and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(new.starts_at, new.ends_at, '[)')
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
        and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(new.starts_at, new.ends_at, '[)')
    ) then
      raise exception 'Stugan kan inte bokas: hela anlaggningen ar bokad under perioden'
        using errcode = '23P01';
    end if;
  end if;

  return new;
end;
$$;

create trigger bookings_korsoverlapp
  before insert or update on public.bookings
  for each row execute function public.kontrollera_korsoverlapp();

-- ─── Spärrade datum ──────────────────────────────────────────────────────
-- Kansliet ska kunna spärra en period utan att hitta på en låtsasbokning:
-- underhåll, egna läger, storhelger man inte vill hyra ut.
create table public.booking_blocks (
  id         uuid primary key default gen_random_uuid(),
  cabin_id   text references public.cabins(id),  -- null = hela anläggningen
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  reason     text check (char_length(reason) <= 500),
  created_at timestamptz not null default now(),

  constraint valid_block_period check (ends_at > starts_at)
);

comment on table public.booking_blocks is
  'Perioder kansliet sparrat. Syns som upptagna i kalendern utan att vara bokningar.';

-- ─── Publik tillgänglighet utan personuppgifter ──────────────────────────
-- Bokningstabellen har ingen publik läspolicy — den innehåller namn, mejl
-- och telefonnummer. Kalendern behöver bara veta VAD som är upptaget NÄR,
-- så det är exakt vad den här funktionen lämnar ut.
--
-- SECURITY DEFINER så att anon kan se upptaget trots RLS på tabellerna.
-- Kolumnlistan är hela poängen: inga kontaktuppgifter passerar här.
create or replace function public.upptagna_perioder()
returns table (objekt text, fran timestamptz, till timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select b.object_key, b.starts_at, b.ends_at
  from public.bookings b
  where b.status in ('bekraftad', 'betald')
  union all
  select coalesce(bl.cabin_id, 'hela-anlaggningen'), bl.starts_at, bl.ends_at
  from public.booking_blocks bl;
$$;

comment on function public.upptagna_perioder() is
  'Upptagna perioder for kalendern: objekt och tider, aldrig personuppgifter.';

revoke all on function public.upptagna_perioder() from public;
grant execute on function public.upptagna_perioder() to anon, authenticated;

-- ─── Row Level Security ──────────────────────────────────────────────────
alter table public.cabins         enable row level security;
alter table public.bookings       enable row level security;
alter table public.booking_blocks enable row level security;

create policy "publicerade stugor lases av alla"
  on public.cabins
  for select
  to anon, authenticated
  using (published = true);

create policy "administratorer skriver stugor"
  on public.cabins
  for all
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

-- Vem som helst får LÄMNA en förfrågan — det är formulärets hela syfte —
-- men bara som just förfrågan. Statusar som blockerar kalendern kan enbart
-- sättas av en administratör: annars hade vem som helst kunnat spärra en
-- helg genom att posta en rad med status bekraftad direkt mot API:et.
create policy "vem som helst lamnar en forfragan"
  on public.bookings
  for insert
  to anon, authenticated
  with check (status = 'forfragan');

create policy "administratorer laser bokningar"
  on public.bookings
  for select
  to authenticated
  using (private.is_admin());

create policy "administratorer andrar bokningar"
  on public.bookings
  for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "administratorer tar bort bokningar"
  on public.bookings
  for delete
  to authenticated
  using (private.is_admin());

create policy "administratorer hanterar sparrar"
  on public.booking_blocks
  for all
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());
