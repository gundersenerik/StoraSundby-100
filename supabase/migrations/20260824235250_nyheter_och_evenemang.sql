-- ═══════════════════════════════════════════════════════════════════════════
--  Migration 010 — nyheter och evenemang
-- ═══════════════════════════════════════════════════════════════════════════
--
--  Innehallstyperna post och event ur config/content.ts. Sajten hanvisar
--  idag till Facebook for "aktuella handelser" — det har ar hemtagningen
--  till egen doman.
--
--  NYHETER AR UTKAST TILLS DE PUBLICERAS. published_at ar bade brytaren
--  och det datum som visas: null betyder utkast, ett varde betyder
--  publicerad da. En kolumn i stallet for tva kan inte hamna i osynk
--  ("publicerad utan datum" eller "datum men opublicerad" kan inte uttryckas).
--
--  EVENEMANG AR HANDELSER I TIDEN och lagras som timestamptz i UTC, samma
--  regel som bokningarna (migration 007). Traningstider ar vaggklockstider
--  och ligger kvar som time — arsmötet den 15 mars kl 18.00 ar daremot en
--  tidpunkt, inte ett aterkommande monster.
--
--  INGA ANON-SKRIVNINGAR ALLS. Till skillnad fran bokningarna finns har
--  inget publikt formular: bara kansliet skriver, sa anon far ingen
--  insert-policy over huvud taget. RLS ar sparren, aldrig en kontroll i
--  en server action.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Nyheter ─────────────────────────────────────────────────────────────
create table public.posts (
  id           uuid primary key default gen_random_uuid(),

  -- Sluggen genereras ur titeln i appen, alltid ascii: a-o utan diakriter,
  -- bindestreck som avdelare. Gamla-sajten-fallan med å/ä i URL:er
  -- (CLAUDE.md) ska inte kunna uppsta har.
  slug         text not null unique
               check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),

  title        text not null check (char_length(title) between 1 and 200),
  lead         text check (char_length(lead) <= 500),
  body         text check (char_length(body) <= 20000),

  -- Fritext, inte en koppling till auth: "Kansliet" eller "Fotbollssektionen"
  -- ar riktigare avsandare an en enskild inloggad ledares adress.
  author       text check (char_length(author) <= 120),

  published_at timestamptz,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.posts is
  'Nyheter. published_at null = utkast; vardet ar ocksa det datum som visas.';

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

create index posts_published_at
  on public.posts (published_at desc)
  where published_at is not null;

alter table public.posts enable row level security;

create policy "publicerade nyheter lases av alla"
  on public.posts
  for select
  to anon, authenticated
  using (published_at is not null);

create policy "administratorer ser alla nyheter"
  on public.posts
  for select
  to authenticated
  using (private.is_admin());

create policy "administratorer skriver nyheter"
  on public.posts
  for all
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

-- ─── Evenemang ───────────────────────────────────────────────────────────
-- Kategorierna ur uppdraget: matcher, tavlingar, lager, arsmote, staddagar
-- och fester ("Tack for hjalpen"). ovrigt for det som inte passar in.
create type public.event_kind as enum
  ('match', 'tavling', 'lager', 'arsmote', 'staddag', 'fest', 'ovrigt');

create table public.events (
  id           uuid primary key default gen_random_uuid(),

  title        text not null check (char_length(title) between 1 and 200),
  kind         public.event_kind not null default 'ovrigt',

  starts_at    timestamptz not null,
  -- Slut ar frivilligt — ett arsmote har en starttid, ett lager ett spann.
  ends_at      timestamptz,

  place        text check (char_length(place) <= 200),
  description  text check (char_length(description) <= 4000),

  -- Frivillig koppling till en sektion. set null i stallet for cascade:
  -- forsvinner en sektion ska handelsen sta kvar, bara utan etikett.
  section_slug text references public.sections(slug) on delete set null,

  published    boolean not null default true,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- NULL-fallan (CLAUDE.md): villkoret ar skrivet sa att null ends_at
  -- passerar avsiktligt — bara ett satt slut maste ligga efter starten.
  constraint events_valid_period check (ends_at is null or ends_at > starts_at)
);

comment on table public.events is
  'Evenemang: match, tavling, lager, arsmote, staddag, fest. Tidpunkter i UTC.';

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create index events_starts_at on public.events (starts_at);

alter table public.events enable row level security;

create policy "publicerade evenemang lases av alla"
  on public.events
  for select
  to anon, authenticated
  using (published = true);

create policy "administratorer ser alla evenemang"
  on public.events
  for select
  to authenticated
  using (private.is_admin());

create policy "administratorer skriver evenemang"
  on public.events
  for all
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());
