-- ═══════════════════════════════════════════════════════════════════════════
--  Migration 004 — adminroll och skrivrättigheter
-- ═══════════════════════════════════════════════════════════════════════════
--
--  Fram till nu har ingen kunnat skriva till databasen annat än via
--  service_role, som går förbi RLS helt. Det var med avsikt: att öppna
--  skrivning innan det finns en adminroll vore att öppna den för alla.
--
--  ADMINISTRATÖRER IDENTIFIERAS PÅ E-POSTADRESS, inte på user_id.
--  Skälet är praktiskt. En ny ledare ska kunna förhandsgodkännas innan hen
--  loggat in första gången — med user_id som nyckel hade raden inte kunnat
--  skapas förrän användaren redan fanns, alltså efter första inloggningen.
--  Adressen i token är verifierad av Supabase Auth: den magiska länken
--  bevisar att personen kontrollerar adressen.
--
--  is_admin() är security definer. Utan det hade varje administratör behövt
--  läsrätt på admin_users för att kunna kontrollera sig själv, och då hade
--  listan över administratörer läckt till alla inloggade.
--
--  OBS: vem som helst kan begära en magisk länk och därmed skapa en rad i
--  auth.users. Det ger ingenting — utan rad i admin_users har man exakt
--  samma rättigheter som en anonym besökare. Skrivning kräver is_admin().
-- ═══════════════════════════════════════════════════════════════════════════

create table public.admin_users (
  email       text primary key,
  name        text,
  note        text,
  created_at  timestamptz not null default now()
);

comment on table public.admin_users is
  'Forhandsgodkanda administratorer. Nyckeln ar e-postadress sa att en person kan laggas till innan forsta inloggningen.';

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

comment on function public.is_admin() is
  'Sant om den inloggades verifierade e-postadress finns i admin_users.';

-- Administratörer får se listan över administratörer. Ingen annan.
-- Skrivning sker enbart via service_role: att lägga till en administratör
-- är ett beslut som ska lämna spår, inte något som görs i ett formulär.
create policy "administratorer ser listan"
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin());

-- ─── Skrivrättigheter på innehållet ──────────────────────────────────────
create policy "administratorer skriver sektioner"
  on public.sections
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "administratorer skriver traningstider"
  on public.training_sessions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Publika policyn visar bara publicerat. Administratörer behöver se utkast.
create policy "administratorer ser opublicerade sektioner"
  on public.sections
  for select
  to authenticated
  using (public.is_admin());

create policy "administratorer ser alla traningstider"
  on public.training_sessions
  for select
  to authenticated
  using (public.is_admin());
