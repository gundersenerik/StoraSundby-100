-- ═══════════════════════════════════════════════════════════════════════════
--  Seed 001 — träningstider som de står på gamla sajten
-- ═══════════════════════════════════════════════════════════════════════════
--
--  Avskrivet ordagrant från föreningens nuvarande webbplats 2026-08-23,
--  sparat i content/legacy/text/. Ingenting är påhittat, ingenting justerat.
--
--  SÄSONGEN ÄR OKÄND. Startsidan anger ingen. Vi vet därför inte om tiderna
--  gäller nu eller är kvar sedan i våras. Säsongen heter tills vidare
--  "okand-2026" och byts när klubben svarat — se C1 i docs/TILL-KLUBBEN.md.
--
--  ÅLDRARNA I GYMNASTIKEN MOTSÄGER SIG SJÄLVA. Startsidan skriver 2–4 och
--  5–8 år, sektionssidan 3–5 och 6–8. Vi följer sektionssidan, som är mer
--  specifik, och behåller startsidans gruppnamn eftersom det är så tiderna
--  presenteras. Avvikelsen står i note-fältet. Se C2 i TILL-KLUBBEN.
--
--  Idempotent. Kan köras om utan att skapa dubbletter.
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.sections (slug, heading, sort_order, published) values
  ('fotboll',             'Fotboll',                       1, true),
  ('orientering',         'Orientering',                   2, true),
  ('orientering-ungdom',  'Orientering barn och ungdom',   3, true),
  ('gymnastik',           'Barngymnastik och Cirkelfys',   4, true),
  ('padel',               'Padel',                         5, true),
  ('skidor',              'Skidor',                        6, true)
on conflict (slug) do update
  set heading = excluded.heading,
      sort_order = excluded.sort_order,
      published = excluded.published;

delete from public.training_sessions where season = 'okand-2026';

insert into public.training_sessions
  (section_slug, grupp, age_from, age_to, weekday, starts_at, ends_at, season, status, note, sort_order)
values
  -- ── Fotboll ────────────────────────────────────────────────────────────
  ('fotboll', 'F/P 2013–2016', null, null, 4, '19:00', '20:00', 'okand-2026', 'aktiv', null, 1),
  ('fotboll', 'F/P 2017',      null, null, 1, '18:30', '19:30', 'okand-2026', 'aktiv', null, 2),
  ('fotboll', 'F/P 2018–2019', null, null, 4, '18:00', '19:00', 'okand-2026', 'aktiv', null, 3),
  ('fotboll', 'Bollek från 2022', null, null, null, null, null, 'okand-2026', 'uppehall',
   'Startsidan anger uppehall utan vare sig dag eller tid.', 4),

  -- ── Orientering ────────────────────────────────────────────────────────
  ('orientering', 'Orientering', null, null, null, null, null, 'okand-2026', 'uppehall',
   'Startsidan anger uppehall utan tider.', 1),

  -- ── Barngymnastik och Cirkelfys ────────────────────────────────────────
  ('gymnastik', 'Barn 2–4 år (tillsammans med förälder)', 3, 5, 7, '09:00', '09:40', 'okand-2026', 'aktiv',
   'Gruppnamnet ar startsidans. Aldersspannet ar sektionssidans (3-5 ar), som ar mer specifikt. Motstridigt - se C2 i TILL-KLUBBEN.', 1),
  ('gymnastik', 'Barn 5–8 år', 6, 8, 7, '10:00', '11:00', 'okand-2026', 'aktiv',
   'Gruppnamnet ar startsidans. Aldersspannet ar sektionssidans (6-8 ar). Motstridigt - se C2 i TILL-KLUBBEN.', 2),
  ('gymnastik', 'Cirkelfys vuxen', null, null, 3, '19:00', '20:00', 'okand-2026', 'aktiv', null, 3),
  ('gymnastik', 'Cirkelfys vuxen', null, null, 7, '16:00', '17:00', 'okand-2026', 'aktiv', null, 4),
  ('gymnastik', 'Senior', 55, null, 3, '18:00', '19:00', 'okand-2026', 'aktiv',
   'Sektionssidan anger +55 ar. Startsidan skrev "Onsdagar18.00-19.00" utan mellanslag.', 5);
