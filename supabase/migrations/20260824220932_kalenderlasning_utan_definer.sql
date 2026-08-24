-- ═══════════════════════════════════════════════════════════════════════════
--  Migration 008 — kalenderläsning utan security definer
-- ═══════════════════════════════════════════════════════════════════════════
--
--  Säkerhetsgranskningen flaggade tre saker i migration 007, alla riktiga:
--
--  1. upptagna_perioder() var SECURITY DEFINER och anropbar av anon. Den
--     läcker inget — kolumnlistan är poängen — men en definer-funktion i
--     det publika API:et är onödig angreppsyta när Postgres kan uttrycka
--     samma sak med rättigheter: KOLUMNGRÄNSEN flyttas till grants, och
--     funktionen blir en vanlig invoker-funktion som RLS gäller rakt
--     igenom. Anon får läsa exakt tre kolumner på blockerande bokningar,
--     och ett försök att läsa contact_name får 42501 av Postgres själv.
--
--  2. kontrollera_korsoverlapp() gick att anropa över REST. En trigger-
--     funktion behöver inget EXECUTE för att avfyras — rättigheten prövas
--     när triggern skapas, inte när den körs — så den återkallas helt.
--
--  3. btree_gist låg i schemat public. Flyttas till extensions, dit
--     Supabase vill ha tillägg. Exclusion-constrainten pekar på
--     operatorklasser via OID och följer med automatiskt.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Kolumnrättigheter i stället för definer ──────────────────────────

-- Anon: läsning begränsas till kalenderns tre kolumner. Radvillkoret — bara
-- blockerande bokningar — ligger i policyn nedan. INSERT-rättigheten från
-- migration 007 (förfrågningar) påverkas inte.
revoke select on public.bookings from anon;
-- status ingår eftersom funktionens WHERE refererar den — kolumnrättigheter
-- prövas mot frågans kolumner, även inuti en invoker-funktion. Den avslöjar
-- inget: att raden syns alls betyder redan att den är bekräftad eller betald.
grant select (object_key, starts_at, ends_at, status) on public.bookings to anon;

create policy "blockerande bokningar syns i kalendern"
  on public.bookings
  for select
  to anon
  using (status in ('bekraftad', 'betald'));

-- Spärrar: anon ser objekt och period men aldrig anledningen — den kan
-- vara intern ("styrelsen behöver helgen").
revoke select on public.booking_blocks from anon;
grant select (cabin_id, starts_at, ends_at) on public.booking_blocks to anon;

create policy "sparrar syns i kalendern"
  on public.booking_blocks
  for select
  to anon
  using (true);

-- Samma funktion, nu SECURITY INVOKER: den läser med anroparens
-- rättigheter, och raderna ovan är allt en anonym anropare kommer åt.
-- Administratörer läser genom sina egna policyer från migration 007 med
-- samma utfall. Inloggade utan adminroll får tomma listor — de publika
-- sidorna läser alltid som anon, så ingen besökare påverkas.
create or replace function public.upptagna_perioder()
returns table (objekt text, fran timestamptz, till timestamptz)
language sql
stable
security invoker
set search_path = ''
as $$
  select b.object_key, b.starts_at, b.ends_at
  from public.bookings b
  where b.status in ('bekraftad', 'betald')
  union all
  select coalesce(bl.cabin_id, 'hela-anlaggningen'), bl.starts_at, bl.ends_at
  from public.booking_blocks bl;
$$;

-- ─── 2. Triggerfunktionen ut ur REST-API:et ──────────────────────────────
revoke all on function public.kontrollera_korsoverlapp() from public, anon, authenticated;

-- ─── 3. Tillägget till rätt schema ───────────────────────────────────────
create schema if not exists extensions;
alter extension btree_gist set schema extensions;
