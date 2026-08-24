-- ═══════════════════════════════════════════════════════════════════════════
--  Migration 005 — is_admin() ut ur det publika API:et
-- ═══════════════════════════════════════════════════════════════════════════
--
--  Supabase säkerhetsgranskning flaggade att public.is_admin() gick att
--  anropa över REST på /rest/v1/rpc/is_admin, av både anon och authenticated.
--
--  Funktionen läcker i sig ingenting — den svarar ja eller nej om den som
--  frågar. Men allt i schemat public exponeras automatiskt av PostgREST, och
--  en security definer-funktion som kan anropas utifrån är onödig angreppsyta.
--
--  Att bara återkalla EXECUTE fungerar inte. En RLS-policy utvärderas med den
--  anropande rollens rättigheter, så utan EXECUTE för authenticated hade
--  policyerna slutat fungera helt.
--
--  Lösningen är att flytta funktionen till ett schema som PostgREST inte
--  exponerar. Policyerna pekar om, och först därefter kan den gamla
--  funktionen tas bort — en funktion som används av en policy går inte att
--  droppa.
-- ═══════════════════════════════════════════════════════════════════════════

create schema if not exists private;

grant usage on schema private to authenticated;

create or replace function private.is_admin()
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

comment on function private.is_admin() is
  'Sant om den inloggades verifierade e-postadress finns i admin_users. Ligger i private for att inte exponeras av PostgREST.';

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- ─── Peka om policyerna ──────────────────────────────────────────────────
drop policy "administratorer ser listan"                on public.admin_users;
drop policy "administratorer skriver sektioner"         on public.sections;
drop policy "administratorer ser opublicerade sektioner" on public.sections;
drop policy "administratorer skriver traningstider"     on public.training_sessions;
drop policy "administratorer ser alla traningstider"    on public.training_sessions;

create policy "administratorer ser listan"
  on public.admin_users for select to authenticated
  using (private.is_admin());

create policy "administratorer skriver sektioner"
  on public.sections for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "administratorer ser opublicerade sektioner"
  on public.sections for select to authenticated
  using (private.is_admin());

create policy "administratorer skriver traningstider"
  on public.training_sessions for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "administratorer ser alla traningstider"
  on public.training_sessions for select to authenticated
  using (private.is_admin());

drop function public.is_admin();
