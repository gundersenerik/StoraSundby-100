-- ═══════════════════════════════════════════════════════════════════════════
--  Migration 011 — index for events.section_slug
-- ═══════════════════════════════════════════════════════════════════════════
--
--  Granskningen fann att FK:n events.section_slug saknade index, i strid
--  med monstret fran migration 001 (training_sessions.section_slug ar
--  indexerad). Utan index kraver "on delete set null" pa sections en
--  sekventiell skanning av events. Tabellen ar liten, men monstret ska
--  vara konsekvent — nasta FK ska inte kunna peka pa ett undantag.
-- ═══════════════════════════════════════════════════════════════════════════

create index events_section_slug on public.events (section_slug);
