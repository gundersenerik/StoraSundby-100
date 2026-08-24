/**
 * Beviset för att dubbelbokningsskyddet bor i databasen.
 *
 * Definition of Done för uthyrningen kräver att exclusion-constrainten är
 * "bevisad med parallellt transaktionstest". Det här scriptet kör alla
 * migrationer från tomt schema mot en riktig Postgres och bevisar sedan:
 *
 *  1. Två SAMTIDIGA transaktioner som bekräftar samma helg → en vinner,
 *     den andra avvisas med 23P01. Inte i följd — samtidigt, med den andra
 *     insertens låsväntan mitt i den förstas öppna transaktion.
 *  2. En förfrågan blockerar ingenting — bara bekräftad och betald gör det.
 *  3. Slutdatum före startdatum avvisas av CHECK (23514), inte av ett
 *     kryptiskt tstzrange-fel (22000).
 *  4. NULL i tidkolumnerna avvisas (23502) — NULL-fällan från CLAUDE.md.
 *  5. Korsöverlapp: hela anläggningen kan inte bekräftas över en bokad
 *     stuga, och tvärtom.
 *  6. Sommartidsskiftet 28–30 mars 2026: incheckning 15.00 och utcheckning
 *     11.00 svensk tid lagras som rätt UTC-tidpunkter och är två nätter.
 *  7. RLS: anon får lämna en förfrågan men inte en bekräftad bokning, och
 *     kan inte läsa bokningstabellen alls. upptagna_perioder() ger objekt
 *     och tider men aldrig kontaktuppgifter.
 *
 * Körning: `npm run test:db`. Med DATABASE_URL används den databasen
 * (CI kör en postgres-servicecontainer). Utan startas en tillfällig lokal
 * Postgres med initdb, som root via systemets postgres-användare.
 */

import { execSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Client } from "pg";

let lokalDatakatalog: string | null = null;
let pgBin = "";
process.exitCode = 0;

function resultat(ok: boolean, namn: string, detalj = "") {
  console.log(`${ok ? "✓" : "✗"} ${namn}${detalj ? ` — ${detalj}` : ""}`);
  if (!ok) process.exitCode = 1;
}

function felkod(e: unknown): string {
  return (e as { code?: string }).code ?? "";
}

async function anslut(url: string, forsok = 30): Promise<Client> {
  for (let i = 0; i < forsok; i++) {
    const klient = new Client({ connectionString: url });
    try {
      await klient.connect();
      return klient;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("Kunde inte ansluta till testdatabasen.");
}

function startaLokalPostgres(): string {
  const ut = spawnSync("bash", ["-lc", "ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1"], {
    encoding: "utf8",
  });
  pgBin = ut.stdout.trim();
  if (!pgBin) throw new Error("Varken DATABASE_URL eller lokala Postgres-binärer hittades.");

  lokalDatakatalog = mkdtempSync(join(tmpdir(), "ssgoif-db-"));
  const somRoot = process.getuid?.() === 0;
  const kor = (kommando: string) =>
    execSync(somRoot ? `su postgres -c ${JSON.stringify(kommando)}` : kommando, { stdio: "ignore" });

  if (somRoot) execSync(`chown postgres:postgres ${lokalDatakatalog}`);
  kor(`${pgBin}/initdb -D ${lokalDatakatalog} -U postgres --auth=trust --no-sync`);
  kor(`${pgBin}/pg_ctl -D ${lokalDatakatalog} -o "-p 55432 -k ${lokalDatakatalog} -c listen_addresses=''" -w start`);
  if (somRoot) execSync(`chmod 777 ${lokalDatakatalog}`);
  return `postgres://postgres@localhost:55432/postgres?host=${encodeURIComponent(lokalDatakatalog)}`;
}

function stoppaLokalPostgres() {
  if (!lokalDatakatalog) return;
  const kommando = `${pgBin}/pg_ctl -D ${lokalDatakatalog} -m immediate stop`;
  if (process.getuid?.() === 0) spawnSync("su", ["postgres", "-c", kommando], { stdio: "ignore" });
  else spawnSync("bash", ["-c", kommando], { stdio: "ignore" });
  rmSync(lokalDatakatalog, { recursive: true, force: true });
}

async function main() {
  const url = process.env.DATABASE_URL ?? startaLokalPostgres();
  const db = await anslut(url);

  // Supabase-miljön stubbas: auth-schemat och rollerna finns inte i ren
  // Postgres, men migrationerna refererar dem. Stubben ger auth.jwt() = null,
  // alltså en anonym anropare.
  await db.query(`
    create schema if not exists auth;
    create or replace function auth.jwt() returns jsonb as $$ select null::jsonb $$ language sql;
    do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
    do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
    do $$ begin create role service_role nologin bypassrls; exception when duplicate_object then null; end $$;
    grant usage on schema public to anon, authenticated;
    alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;
    alter default privileges in schema public grant execute on functions to anon, authenticated;
  `);

  // Alla migrationer i filnamnsordning, från tomt schema.
  const katalog = resolve(import.meta.dirname, "../../supabase/migrations");
  const filer = readdirSync(katalog).filter((f) => f.endsWith(".sql")).sort();
  for (const fil of filer) {
    await db.query(readFileSync(join(katalog, fil), "utf8"));
  }
  resultat(true, `Alla ${filer.length} migrationer kör framåt från tomt schema`);

  await db.query(readFileSync(resolve(import.meta.dirname, "../../supabase/seed/003_stugor.sql"), "utf8"));

  const bokning = (kolumner: string) => `
    insert into public.bookings
      (cabin_id, starts_at, ends_at, party_size, purpose, contact_name, contact_email, status)
    values ${kolumner}`;

  const rad = (stuga: string | null, fran: string, till: string, status = "bekraftad") =>
    `(${stuga === null ? "null" : `'${stuga}'`}, '${fran}', '${till}', 4, 'overnattning', 'Test Person', 'test@example.com', '${status}')`;

  // ── 1. Parallella transaktioner om samma helg ─────────────────────────
  const a = await anslut(url);
  const b = await anslut(url);
  await a.query("begin");
  await b.query("begin");
  await a.query(bokning(rad("stuga-1", "2026-10-02 13:00+00", "2026-10-04 09:00+00")));
  // B:s insert ställer sig i låskö bakom A:s öppna transaktion.
  const bInsert = b.query(bokning(rad("stuga-1", "2026-10-03 13:00+00", "2026-10-05 09:00+00")));
  await new Promise((r) => setTimeout(r, 300));
  await a.query("commit");
  let bAvvisad = "";
  try {
    await bInsert;
    await b.query("commit");
  } catch (e) {
    bAvvisad = felkod(e);
    await b.query("rollback").catch(() => undefined);
  }
  resultat(bAvvisad === "23P01", "Parallella transaktioner: databasen avvisar den andra bokningen", `felkod ${bAvvisad || "(ingen)"}`);
  await a.end();
  await b.end();

  // ── 2. En förfrågan blockerar ingenting ───────────────────────────────
  await db.query(bokning(rad("stuga-1", "2026-10-02 13:00+00", "2026-10-04 09:00+00", "forfragan")));
  resultat(true, "En förfrågan krockar inte med en bekräftad bokning — bara bekräftad och betald blockerar");

  // ── 3. Slut före start ────────────────────────────────────────────────
  try {
    await db.query(bokning(rad("stuga-2", "2026-10-04 13:00+00", "2026-10-02 09:00+00")));
    resultat(false, "Slutdatum före startdatum borde ha avvisats");
  } catch (e) {
    resultat(felkod(e) === "23514", "Slutdatum före startdatum avvisas av CHECK, inte av tstzrange", `felkod ${felkod(e)}`);
  }

  // ── 4. NULL-fällan ────────────────────────────────────────────────────
  try {
    await db.query(`
      insert into public.bookings (cabin_id, starts_at, ends_at, party_size, purpose, contact_name, contact_email, status)
      values ('stuga-2', null, '2026-10-04 09:00+00', 4, 'overnattning', 'T', 't@example.com', 'bekraftad')`);
    resultat(false, "NULL i starts_at borde ha avvisats");
  } catch (e) {
    resultat(felkod(e) === "23502", "NULL i tidkolumn avvisas — constrainten kan inte kringgås tyst");
  }

  // ── 5. Korsöverlapp ───────────────────────────────────────────────────
  try {
    await db.query(bokning(rad(null, "2026-10-03 13:00+00", "2026-10-05 09:00+00")));
    resultat(false, "Hela anläggningen över en bokad stuga borde ha avvisats");
  } catch (e) {
    resultat(felkod(e) === "23P01", "Hela anläggningen kan inte bokas över en bokad stuga");
  }
  await db.query(bokning(rad(null, "2026-11-06 13:00+00", "2026-11-08 09:00+00")));
  try {
    await db.query(bokning(rad("stuga-3", "2026-11-07 13:00+00", "2026-11-09 09:00+00")));
    resultat(false, "Stuga över bokad helanläggning borde ha avvisats");
  } catch (e) {
    resultat(felkod(e) === "23P01", "En stuga kan inte bokas när hela anläggningen är bokad");
  }

  // ── 6. Sommartidsskiftet ──────────────────────────────────────────────
  // 15.00 svensk tid 28 mars är 14.00 UTC (vintertid); 11.00 svensk tid
  // 30 mars är 09.00 UTC (sommartid). Två kalendernätter.
  await db.query(bokning(rad("stuga-2", "2026-03-28 14:00+00", "2026-03-30 09:00+00")));
  const dst = await db.query(`
    select
      to_char(starts_at at time zone 'Europe/Stockholm', 'YYYY-MM-DD HH24:MI') as lokal_start,
      to_char(ends_at   at time zone 'Europe/Stockholm', 'YYYY-MM-DD HH24:MI') as lokal_slut,
      (date(ends_at at time zone 'Europe/Stockholm') - date(starts_at at time zone 'Europe/Stockholm')) as natter
    from public.bookings
    where starts_at = '2026-03-28 14:00+00'
  `);
  const skifte = dst.rows[0];
  resultat(
    skifte.lokal_start === "2026-03-28 15:00" && skifte.lokal_slut === "2026-03-30 11:00" && Number(skifte.natter) === 2,
    "Sommartidsskiftet: 28–30 mars är incheckning 15.00, utcheckning 11.00 och två nätter",
    `${skifte.lokal_start} → ${skifte.lokal_slut}, ${skifte.natter} nätter`,
  );

  // ── 7. RLS som anon ───────────────────────────────────────────────────
  await db.query("set role anon");
  try {
    // Speglar appens riktiga insert (boka/actions.ts): status skickas ALDRIG
    // med — kolumngranten täcker den inte, raden får default 'forfragan',
    // och policyn godkänner den. Ett test som listar status explicit provar
    // något appen aldrig gör, och föll mycket riktigt på kolumngranten.
    await db.query(`
      insert into public.bookings (cabin_id, starts_at, ends_at, party_size, purpose, contact_name, contact_email)
      values ('stuga-4', '2026-12-04 13:00+00', '2026-12-06 09:00+00', 4, 'overnattning', 'Test Person', 'test@example.com')`);
    resultat(true, "Anon får lämna en förfrågan — utan att röra status eller pris");
  } catch (e) {
    resultat(false, "Anon borde få lämna en förfrågan", `felkod ${felkod(e)}`);
  }
  try {
    await db.query(bokning(rad("stuga-4", "2027-05-07 13:00+00", "2027-05-09 09:00+00", "forfragan")));
    resultat(false, "Anon borde inte kunna sätta status ens till forfragan");
  } catch (e) {
    resultat(felkod(e) === "42501", "Anon kan inte sätta status alls — kolumnen är inte hens");
  }
  try {
    await db.query(bokning(rad("stuga-4", "2026-12-11 13:00+00", "2026-12-13 09:00+00")));
    resultat(false, "Anon borde inte kunna skapa en bekräftad bokning");
  } catch (e) {
    resultat(felkod(e) === "42501", "Anon kan inte skapa en bekräftad bokning och därmed spärra kalendern");
  }
  // Kolumnrättigheterna från migration 008: anon läser kalenderns tre
  // kolumner på blockerande rader, men kontaktuppgifterna stoppas av
  // Postgres själv med 42501 — inte av att applikationen låter bli att fråga.
  try {
    await db.query("select contact_name from public.bookings limit 1");
    resultat(false, "Anon borde inte kunna läsa contact_name");
  } catch (e) {
    resultat(felkod(e) === "42501", "Anon nekas kontaktuppgifter av kolumnrättigheterna", `felkod ${felkod(e)}`);
  }
  try {
    await db.query("select * from public.bookings limit 1");
    resultat(false, "Anon borde inte kunna läsa hela bokningsraden");
  } catch (e) {
    resultat(felkod(e) === "42501", "Anon nekas select * på bokningstabellen");
  }
  const anonKalender = await db.query(
    "select object_key from public.bookings",
  );
  resultat(
    anonKalender.rows.length === 3,
    "Anon ser kalenderkolumnerna på exakt de blockerande raderna",
    `${anonKalender.rows.length} rader (förfrågningarna syns inte)`,
  );

  const perioder = await db.query("select * from public.upptagna_perioder()");
  const kolumner = Object.keys(perioder.rows[0] ?? {});
  resultat(
    perioder.rows.length >= 3 &&
      kolumner.length === 3 &&
      kolumner.every((k) => ["objekt", "fran", "till"].includes(k)),
    "upptagna_perioder() ger anon objekt och tider men inga personuppgifter",
    `${perioder.rows.length} perioder, kolumner: ${kolumner.join(", ")}`,
  );

  // Spärrar: perioden syns, anledningen gör det inte.
  await db.query("reset role");
  await db.query(
    "insert into public.booking_blocks (cabin_id, starts_at, ends_at, reason) values (null, '2027-01-08 00:00+00', '2027-01-11 00:00+00', 'intern anledning')",
  );
  await db.query("set role anon");
  const sparr = await db.query("select cabin_id, starts_at, ends_at from public.booking_blocks");
  resultat(sparr.rows.length === 1, "Anon ser spärrens period i kalendern");
  try {
    await db.query("select reason from public.booking_blocks limit 1");
    resultat(false, "Anon borde inte kunna läsa spärrens anledning");
  } catch (e) {
    resultat(felkod(e) === "42501", "Spärrens anledning är inte publik — den kan vara intern");
  }
  await db.query("reset role");

  // ── 8. Granskningens tre hål, stängda i migration 009 ─────────────────
  // Anon kan inte prissätta sin egen förfrågan.
  await db.query("set role anon");
  try {
    await db.query(`
      insert into public.bookings (cabin_id, starts_at, ends_at, party_size, purpose, contact_name, contact_email, estimated_price)
      values ('stuga-5', '2027-02-05 13:00+00', '2027-02-07 09:00+00', 4, 'overnattning', 'T', 't@example.com', 1)`);
    resultat(false, "Anon borde inte kunna sätta estimated_price");
  } catch (e) {
    resultat(felkod(e) === "42501", "Anon kan inte prissätta sin egen förfrågan — priset är kansliets kolumn");
  }
  try {
    await db.query(`
      insert into public.bookings (cabin_id, starts_at, ends_at, party_size, purpose, contact_name, contact_email, paminnelse_skickad_at)
      values ('stuga-5', '2027-02-05 13:00+00', '2027-02-07 09:00+00', 4, 'overnattning', 'T', 't@example.com', now())`);
    resultat(false, "Anon borde inte kunna förstämpla påminnelsen");
  } catch (e) {
    resultat(felkod(e) === "42501", "Anon kan inte förstämpla påminnelsen så att den uteblir");
  }
  await db.query("reset role");

  // En bokning kan inte bekräftas över en spärrad period.
  await db.query(`
    insert into public.booking_blocks (cabin_id, starts_at, ends_at, reason)
    values ('stuga-6', '2027-03-05 00:00+00', '2027-03-08 00:00+00', 'underhall')`);
  try {
    await db.query(bokning(rad("stuga-6", "2027-03-06 13:00+00", "2027-03-07 09:00+00")));
    resultat(false, "Bekräftelse över en spärr borde ha avvisats");
  } catch (e) {
    resultat(felkod(e) === "23P01", "En bokning kan inte bekräftas över en spärrad period");
  }
  // Spärr på en stuga stoppar även hela anläggningen.
  try {
    await db.query(bokning(rad(null, "2027-03-06 13:00+00", "2027-03-07 09:00+00")));
    resultat(false, "Helanläggning över en stugspärr borde ha avvisats");
  } catch (e) {
    resultat(felkod(e) === "23P01", "En spärr på en stuga stoppar även hela anläggningen");
  }

  // Kapplöpningen: stuga och hela anläggningen samtidigt, olika
  // objektnycklar — exclusion-constrainten serialiserar dem inte, det gör
  // rådgivningslåset i triggern.
  const c = await anslut(url);
  const d = await anslut(url);
  await c.query("begin");
  await d.query("begin");
  await c.query(bokning(rad("stuga-4", "2027-04-02 13:00+00", "2027-04-04 09:00+00")));
  const dInsert = d.query(bokning(rad(null, "2027-04-03 13:00+00", "2027-04-05 09:00+00")));
  await new Promise((r) => setTimeout(r, 300));
  await c.query("commit");
  let dAvvisad = "";
  try {
    await dInsert;
    await d.query("commit");
  } catch (e) {
    dAvvisad = felkod(e);
    await d.query("rollback").catch(() => undefined);
  }
  resultat(
    dAvvisad === "23P01",
    "Kapplöpning stuga mot hela anläggningen: låset serialiserar och den andra avvisas",
    `felkod ${dAvvisad || "(ingen — båda gick igenom)"}`,
  );
  await c.end();
  await d.end();

  await db.end();
}

main()
  .catch((fel) => {
    console.error(fel);
    process.exitCode = 1;
  })
  .finally(() => {
    stoppaLokalPostgres();
    process.exit(process.exitCode ?? 0);
  });
