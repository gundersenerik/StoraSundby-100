-- ═══════════════════════════════════════════════════════════════════════════
--  Migration 001 — sektioner och träningstider
-- ═══════════════════════════════════════════════════════════════════════════
--
--  Medvetet smal. Två tabeller, inte tjugo. Syftet är att bevisa att
--  migrationer, RLS och tidshanteringen fungerar innan hela datamodellen
--  ligger på. Resten kommer modul för modul.
--
--  ARBETSFÖRDELNING MOT config/club.ts:
--  Vilka sektioner som FINNS, vad de heter och vem man kontaktar är
--  klubbfakta och bor i config/club.ts. Den här tabellen håller bara det
--  redigerbara INNEHÅLLET per sektion. Slug är kopplingen. Skulle namnet
--  ligga i båda hade vi haft två sanningar, vilket är precis det
--  kontraktet finns för att förhindra.
--
--  TIDER: träningstider lagras som `time`, inte `timestamptz`.
--  Ett pass klockan 19.00 är 19.00 året om. Lagrades det som en tidpunkt i
--  UTC skulle passet flytta sig en timme vid sommartidsskiftet, vilket vore
--  fel. Kravet på timestamptz gäller händelser i tiden — bokningar, matcher,
--  betalningar — inte återkommande veckotider.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Hjälpfunktion: håller updated_at aktuell ────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── Sektioner ───────────────────────────────────────────────────────────
create table public.sections (
  -- Måste motsvara en slug i club.sections. Kontrolleras i seed, inte i SQL.
  slug         text primary key,
  heading      text,
  intro        text,
  body         text,
  hero_image   text,
  sort_order   integer     not null default 0,
  published    boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.sections is
  'Redigerbart innehåll per sektion. Namn och kontaktperson bor i config/club.ts.';

create trigger sections_set_updated_at
  before update on public.sections
  for each row execute function public.set_updated_at();

-- ─── Träningstider ───────────────────────────────────────────────────────
-- Statusen `uppehall` är förstaklassbegrepp. Webbplatsen använder det redan
-- för Bollek och orientering. Ett pausat pass ska visas som pausat, inte
-- försvinna.
create type public.training_status as enum ('aktiv', 'uppehall', 'installd');

create table public.training_sessions (
  id            uuid primary key default gen_random_uuid(),
  section_slug  text not null references public.sections(slug) on delete cascade,

  -- Gruppens namn som det skrivs för besökaren, t.ex. "F/P 2013–2016".
  grupp         text not null,
  age_from      integer,
  age_to        integer,

  -- ISO-8601: 1 = måndag, 7 = söndag.
  weekday       integer not null,
  starts_at     time    not null,
  ends_at       time    not null,

  place         text,
  -- Fritext tills säsongsbegreppet är bekräftat med klubben. Se TILL-KLUBBEN C1.
  season        text    not null,
  status        public.training_status not null default 'aktiv',
  note          text,
  sort_order    integer not null default 0,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint weekday_iso   check (weekday between 1 and 7),
  constraint valid_period  check (ends_at > starts_at),
  constraint valid_age     check (age_from is null or age_to is null or age_to >= age_from)
);

comment on column public.training_sessions.starts_at is
  'Väggklockstid, inte tidpunkt. 19.00 är 19.00 aven efter sommartidsskiftet.';

create trigger training_sessions_set_updated_at
  before update on public.training_sessions
  for each row execute function public.set_updated_at();

-- Den publika vyn filtrerar på säsong och sorterar på veckodag och tid.
create index training_sessions_schema_idx
  on public.training_sessions (season, weekday, starts_at);

create index training_sessions_section_idx
  on public.training_sessions (section_slug);

-- ─── Row Level Security ──────────────────────────────────────────────────
-- Publikt innehåll läses anonymt. Skrivning sker tills vidare enbart via
-- service_role, som går förbi RLS. Skrivpolicyer för admin läggs till i den
-- migration som inför admin_users — att öppna skrivning innan det finns en
-- adminroll vore att öppna den för alla.
alter table public.sections           enable row level security;
alter table public.training_sessions  enable row level security;

create policy "publicerade sektioner lases av alla"
  on public.sections
  for select
  to anon, authenticated
  using (published = true);

create policy "traningstider lases av alla"
  on public.training_sessions
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.sections s
      where s.slug = training_sessions.section_slug
        and s.published = true
    )
  );
