-- ═══════════════════════════════════════════════════════════════════════════
--  Seed 003 — stugorna
-- ═══════════════════════════════════════════════════════════════════════════
--
--  ANTALET ÄR HÄRLETT, INTE BEKRÄFTAT. Webbplatsen anger 8 bäddar per stuga
--  och plats för 48 personer totalt, men skriver aldrig ut antalet stugor.
--  48 / 8 = 6, och samma härledning ligger som todo() i config
--  (club.facility.cabins.count). Ett enhetstest kontrollerar att seedens
--  antal och konfigurationens antal är samma siffra, så de inte glider isär.
--
--  NAMNEN ÄR TILLFÄLLIGA. Vad stugorna faktiskt heter eller numreras som är
--  fråga B3 i TILL-KLUBBEN. dog_friendly är null på samtliga: webbplatsen
--  säger att EN stuga tillåter hund men inte vilken, och att gissa vilken
--  vore att hitta på ett faktum.
--
--  Idempotent. Kan köras om utan att skapa dubbletter.
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.cabins (id, namn, beds, dog_friendly, sort_order, published) values
  ('stuga-1', 'Stuga 1', 8, null, 1, true),
  ('stuga-2', 'Stuga 2', 8, null, 2, true),
  ('stuga-3', 'Stuga 3', 8, null, 3, true),
  ('stuga-4', 'Stuga 4', 8, null, 4, true),
  ('stuga-5', 'Stuga 5', 8, null, 5, true),
  ('stuga-6', 'Stuga 6', 8, null, 6, true)
on conflict (id) do update
  set namn = excluded.namn,
      beds = excluded.beds,
      sort_order = excluded.sort_order,
      published = excluded.published;
