# Beslutslogg

Arkitekturbeslut med alternativ, val och motiv. Skriven för den som tar över
om två år och undrar varför något ser ut som det gör.

Nyast först.

---

## 2026-08-24 — Granskningen fällde sju fynd; alla åtgärdade före push

En adversariell granskning i fyra dimensioner (logik, SQL/RLS, röst och
kontrakt, CI-hållbarhet) kördes på hela modulen innan den committades, med
en skeptiker per fynd som försökte motbevisa det mot koden. Sju fynd höll:

1. Anon kunde sätta `estimated_price` och `paminnelse_skickad_at` via en
   direkt REST-insert — beloppet hade flutit in i bekräftelsemejlets
   betalinstruktion. Stängt med kolumnvis INSERT (migration 009); priset
   sätts nu av kansliets bekräftelse, aldrig av den som frågar.
2. Spärrar deltog inte i dubbelbokningsskyddet — en bokning kunde
   bekräftas rakt över en spärrad period. Triggern kontrollerar nu även
   `booking_blocks`.
3. Korsöverlappet var racigt: stuga och hela anläggningen kunde bekräftas
   samtidigt, eftersom olika objektnycklar inte serialiseras av exclusion-
   constrainten. Triggern tar nu ett rådgivande transaktionslås.
4. Tidsspärren i formuläret nollställdes vid varje rendering — en gäst som
   rättade ett valideringsfel inom tre sekunder kastades tyst som robot,
   med falskt "skickat"-besked. Värdet fryses nu vid montering.
5. Påminnelse-cronen var en öppen endpoint som läste med service role och
   skickade mejl, och stämplingen var inte atomär. Nu bakom CRON_SECRET
   (Vercel skickar headern automatiskt) med anspråk-först-stämpling.
6. En endagsspärr avvisades felaktigt, och spärrlistan visade det
   exklusivt lagrade slutdatumet som om det vore inklusivt.
7. E2E-spärrtestet lämnade en publikt synlig låtsasspärr i skarpa
   databasen mellan körningar. Testet städar nu efter sig och specarna
   rensar fixturer även efteråt.

Punkt 1–3 och 6 är bevisade i `tests/db/dubbelbokning.ts` (20 påståenden).
Slutsatsen för arbetssättet: den egna verifieringskedjan räckte inte —
alla sju passerade typecheck, lint, 57 enhetstester och bygget.

## 2026-08-24 — In- och utcheckningstider är ett driftbeslut, inte ett klubbfaktum

Granskningen invände att tiderna 15.00 och 11.00 är antagna men ändå står
i mejl till gäster, vilket skaver mot regeln att platshållarvärden aldrig
publiceras. Avvägningen: regeln finns för FAKTAPÅSTÅENDEN om föreningen —
priser, organisationsnummer, historia — där ett påhittat värde är en osann
utsaga. In- och utcheckning är den nya sajtens egen bokningspolicy: någon
måste välja ett standardvärde för att bokningar ska kunna vara tidpunkter,
och 15.00/11.00 är branschnormalen. Värdena står som todo() under "bör
bekräftas" och byts på en rad om kansliet vill annat. Ett bokningsmejl
utan incheckningstid hade varit sämre för gästen än ett med en rimlig tid
kansliet kan justera.

## 2026-08-24 — Dubbelbokningsskyddet bor i databasen, med en trigger för korsfallet

**Alternativ:** kontrollera överlapp i server-actionen, eller låta databasen
avgöra.

**Val:** en exclusion-constraint på en objektnyckel
(`coalesce(cabin_id, 'hela-anlaggningen')`) med halvöppet intervall `[)`,
villkorad på status bekräftad/betald, plus en trigger för korsfallet — hela
anläggningen krockar med varje enskild stuga och tvärtom, vilket en
constraint som jämför lika nycklar inte kan uttrycka.

**Motiv:** en kontroll i en server action är ett lager som kan glömmas vid
nästa action. Databasen glömmer inte. NULL-fällan från CLAUDE.md är stängd
med NOT NULL på båda tidkolumnerna, och triggern släpper ogiltiga perioder
vidare till CHECK-en så att felet blir begripligt i stället för ett
tstzrange-kast. Bevisat i `tests/db/dubbelbokning.ts` med parallella
transaktioner, och i CI mot en Postgres-servicecontainer på varje push.

Triggern är security definer av nödvändighet: den läser bokningstabellen,
och den som lämnar en förfrågan är anonym utan läsrätt. Med invoker hade
RLS gömt alla rader för kontrollen, som då alltid sagt ja.

## 2026-08-24 — Priser visas först när todo()-wrappern är borta

**Alternativ:** visa de påhittade beloppen märkta "preliminärt", eller inte
visa några belopp alls.

**Val:** `priserArPlatshallare()` läser platshållarregistret, och så länge
`club.rental.prices` står som placeholder visar sidan, formuläret och
mejlen ingen summa — de säger att kansliet återkommer med pris. Den dag
kansliet svarat byts värdena, wrappern tas bort, och prisvisningen
aktiverar sig själv utan kodändring. Ett enhetstest bevakar gatingen.

**Motiv:** "publicera aldrig ett platshållarvärde" gäller belopp lika
mycket som organisationsnummer. Ett påhittat pris i ett bokningsflöde är
ett felaktigt anbud till en riktig kund, och "preliminärt" i liten stil
räddar inte det.

## 2026-08-24 — Stugorna som bokningsobjekt trots att antalet är härlett

KALLOR.md slog fast att antalet stugor inte publiceras, eftersom det är
uträknat (48 bäddar ÷ 8) och inte utskrivet. Bokningsflödet kräver ändå
bokningsbara objekt — utan dem finns ingen kalender och inget formulär.

**Val:** sex stugor seedas som data (`supabase/seed/003_stugor.sql`), med
tillfälliga namn och `dog_friendly = null` på samtliga — webbplatsen säger
att EN stuga tillåter hund men inte vilken, och att gissa vilken vore att
hitta på ett faktum. Sidan listar objekten men skriver aldrig ut antalet
som ett påstående i löptext. Ett enhetstest ser till att seedens antal och
`club.facility.cabins.count` inte glider isär, så när kansliet svarar (B3)
ändras båda i samma leverans.

**Motiv:** prompten säger uttryckligen att bygget inte får stanna på ett
obesvarat mejl — det är hela poängen med platshållarmekaniken. Alternativet,
att vänta med hela modulen, hade gjort svaret på B3 till en blockerare i
stället för en rättelse på en rad.

## 2026-08-24 — Kalendern läses med kolumnrättigheter, inte security definer

**Vad som hände:** den publika kalendern behöver veta vad som är upptaget
utan att kontaktuppgifter läcker. Första versionen löste det med en
security definer-funktion med snäv kolumnlista. Supabase säkerhetsgranskning
flaggade den — en definer-funktion anropbar av anon i det publika API:et är
onödig angreppsyta även när den inget läcker.

**Val (migration 008):** kolumnrättigheter i Postgres. Anon får SELECT på
exakt fyra kolumner i bokningstabellen och en radpolicy som bara släpper
igenom blockerande bokningar; spärrarnas anledning är inte läsbar alls.
Funktionen blev security invoker. Ett försök att läsa `contact_name` som
anon får 42501 av Postgres själv — bevisat i databastestet.

**Motiv:** samma princip som is_admin-flytten i migration 005: spärren ska
ligga så långt ner det går, och en rättighet Postgres upprätthåller slår
en kolumnlista någon lovat att inte ändra.

## 2026-08-24 — Migrationsfilnamnen 004–006 matchade inte registrerade versioner

Samma fälla som redan rättats för 001–003 i commit `71a038c`, upptäckt när
migration 007 skulle namnges: filerna för admin, is_admin-flytten och
massåtgärderna bar andra tidsstämplar än de versioner Supabase registrerat.
`supabase db push` hade försökt applicera dem igen mot en databas som redan
har dem. Omdöpta till 215225, 215357 och 235113. Kontrollera alltid
`list_migrations` efter en applicering — verktyget stämplar med sin egen
klocka, inte med filnamnets.

## 2026-08-24 — Commit 207a453 innehåller arbete från en annan session

**Vad som hände:** commit `207a453`, med meddelandet "CLAUDE.md sa att nasta
instans kan ta vid", innehåller 17 filer och 981 rader. Bara CLAUDE.md hör
till det meddelandet.

Resten — `app/admin/innehall/`, massåtgärderna som databasfunktioner med
migration `20260823235113`, `app/api/keep-alive/` och `vercel.json` — kom
från en parallell session som arbetade mot samma filsystem och samma
Supabase-projekt, men inte mot GitHub. Ett `git add -A` svepte in allt.

**Konsekvens:** historiken beskriver inte vad som faktiskt hände i den
commiten. Den skrivs inte om — den ligger redan på GitHub, och en
omskriven historik är värre än en felmärkt. Den här noteringen är
rättelsen.

**Vad det kostade:** jag byggde massåtgärderna en gång till, i
applikationslagret, utan att veta att de redan fanns i databasen. Den
befintliga lösningen var dessutom bättre — en `update` i SQL är atomisk,
medan en loop i JavaScript kan lämna halva schemat flyttat. Min version
kastades.

**Vad som ändras framåt:** `git status` före varje commit, inte efter, och
namngivna filer i stället för `git add -A`. Det senare fungerade så länge
en enda session rörde repot, och slutade fungera i samma sekund som något
annat gjorde det.

---

## 2026-08-23 — Träningstider lagras som `time`, inte `timestamptz`

**Alternativ:** följa prompten bokstavligt, som säger att alla tidsstämplar
ska vara `timestamptz`.

**Val:** `time` för återkommande veckotider.

**Motiv:** ett pass klockan 19.00 är 19.00 året om. Lagrades det som en
tidpunkt i UTC skulle passet flytta sig en timme vid sommartidsskiftet, och
hela höstschemat hade blivit fel en söndag i oktober.

Kravet på `timestamptz` gäller händelser i tiden — bokningar, matcher,
betalningar, revisionsloggar. Där gäller det fullt ut. En återkommande
veckotid är inte en händelse utan ett mönster.

---

## 2026-08-23 — Uppehåll fick två migrationer i stället för en

**Val:** `starts_at`, `ends_at` och `weekday` är valfria, men bara när
statusen är `uppehall`.

**Motiv:** startsidan listar "Bollek från 2022: Uppehåll" och "Orientering:
Uppehåll" helt utan dag och tid. Med `not null` gick de inte att lägga in och
hade försvunnit ur schemat, vilket kontraktet uttryckligen förbjuder.

Att bara ta bort `not null` hade varit fel — då kunde ett *aktivt* pass sakna
tider. Villkoret flyttades i stället till statusen.

**Varför två migrationer:** 002 fixade tiderna, 003 veckodagen. Jag såg halva
problemet först. Migrationer skrivs inte om i efterhand; historiken ska visa
vad som hände.

**Notera** hur `valid_period` är formulerad. En jämförelse med NULL ger NULL,
vilket en `CHECK` behandlar som uppfylld — villkoret hoppas alltså över tyst.
Samma fälla gäller exclusion constraints på bokningar i modul 3. Här är det
ofarligt eftersom `tider_kravs_om_aktiv` redan garanterar att värdena finns
när de spelar roll.

---

## 2026-08-23 — Supabase-nycklarna som repo-variabler, inte secrets

**Val:** `NEXT_PUBLIC_SUPABASE_URL` och `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
ligger som GitHub Actions-variabler.

**Motiv:** de är publika by design. Båda skickas till varje besökares
webbläsare, och det som skyddar datan är Row Level Security, inte att nyckeln
är hemlig. Att lägga dem som secrets hade antytt en säkerhet de inte ger.

`SUPABASE_SERVICE_ROLE_KEY` går förbi RLS och är en riktig hemlighet. Den
finns varken i CI, i Vercel eller i repot ännu.

**Bakgrund:** bygget failade i CI först, eftersom `lib/supabase.ts` kastar vid
modulladdning när variablerna saknas. Det beteendet behölls med avsikt — en
tyst fallback hade gett en sajt utan innehåll i stället för ett tydligt fel.

---

## 2026-08-23 — Originalen från gamla sajten ligger i git

**Alternativ:** lägga de 26 MB bilder i git, eller hålla dem utanför och
bara versionshantera texten.

**Val:** i git.

**Motiv:** bilderna ligger idag på Hemsida24:s CDN. Den dagen abonnemanget
sägs upp finns de ingenstans. 26 MB är litet nog att inte märkas i ett repo
som aldrig kommer innehålla video, och alternativet — en mapp på någons
dator — är precis så ömtåligt som problemet vi försöker lösa.

Bilderna optimeras och läggs i Supabase Storage när modul 1 byggs.
Originalen ligger kvar orörda.

**Reversibelt:** ja, men klumpigt. Att lyfta ut dem ur historiken kräver att
den skrivs om.

---

## 2026-08-23 — Tailwind: `@theme inline` för färger, `@theme static` för resten

**Alternativ:** ett enda `@theme`-block för alla tokens.

**Val:** två block med olika beteende.

**Motiv:** upptäckt genom att inspektera den byggda CSS-filen, inte genom
att läsa dokumentation.

Färgerna måste ligga i `inline`. Utan det kopierar Tailwind det ljusa värdet
in i varje utility, så `bg-brand` pekar på en färg i stället för på rollen —
och mörkt läge slutar fungera helt.

Resten måste ligga i `static`. Tailwind trädskakar bort tokens den inte
hittar användning för i källkoden, och en dynamisk referens av typen
`var(--text-${steg})` går inte att upptäcka statiskt. Första bygget tappade
hela typskalan och alla radier. Felet syntes inte i något kommando — bara i
den byggda CSS-filen.

Sedan verifieras samtliga nio textsteg och tolv spacingsteg mot bygget.

---

## 2026-08-23 — Next 16, inte 15 som prompten anger

**Alternativ:** följa prompten och låsa till Next 15.

**Val:** Next 16.

**Motiv:** `next@latest` ger 16.3.2. Prompten skrevs mot 15, men att starta
ett projekt som ska hålla i tio år på n-1 innebär en uppgradering nästan
omedelbart, med en tom app och noll nytta av att vänta.

**Reversibelt:** ja, så länge appen är i princip tom. Backa med
`npm install next@15 && npm run build`. Ju fler komponenter som byggs desto
dyrare blir det, så invänd nu om du vill.

Verifierat: bygget går igenom, redirects hamnar i routes-manifestet,
typkontrollen är ren.

---

## 2026-08-23 — `swap-list:strict` körs inte på varje push

**Alternativ:** köra den som alla andra kontroller.

**Val:** eget jobb som bara startas manuellt.

**Motiv:** den avslutar med exit 1 så länge en enda lanseringsblockerare
finns kvar. Det ska den göra i månader. En CI-pipeline som alltid är röd
slutar folk titta på, och då fångar den ingenting den dagen den betyder
något.

Den blir obligatorisk inför produktionsdeploy. Det är där den hör hemma —
den ska hindra en lansering, inte en commit.

---

## 2026-08-23 — `app/tokens.css` genereras och undantas från lint:hardcoded

**Alternativ:** skriva CSS-variablerna för hand.

**Val:** generera dem ur `design.ts` med `npm run gen:tokens`.

**Motiv:** designkontraktet säger att inget hex-värde får skrivas utanför
`config/`. En handskriven `tokens.css` hade varit en andra sanning om
färgerna, alltså precis det kontraktet finns för att förhindra.

Filen innehåller hex-värden och undantas därför från `lint:hardcoded` — det
är hela dess uppgift. Att den är i synk med `design.ts` kontrolleras i CI i
stället, genom att köra generatorn och faila om resultatet skiljer sig från
det som är committat.

Samma mönster som `SWAP-LIST.md`: en genererad fil kan inte bli inaktuell.

---

## 2026-08-23 — Dokumentnamn med bindestreck, allt under `docs/`

**Alternativ:** följa prompten bokstavligt, som växlar mellan
`TILL_KLUBBEN.md` och `docs/TILL-KLUBBEN.md`.

**Val:** bindestreck genomgående, allt under `docs/`.

**Motiv:** prompten är inkonsekvent med sig själv i den här detaljen. Två
stavningar av samma filnamn hade förr eller senare gett två filer med
överlappande innehåll. Bindestreck matchar README och de två filer som redan
fanns i repot.

---

## 2026-08-23 — `main` som branch, git-identitet satt lokalt

**Val:** branchen döptes om från `master` till `main`. Git-identiteten sattes
med `--local`, inte `--global`.

**Motiv:** GitHub hade redan `main` som default, så repot hade annars fått två
divergerande grenar direkt.

Maskinen saknade git-identitet helt. Den sattes bara i det här repot för att
inte påverka andra projekt. Commits står som `Claude <noreply@anthropic.com>`,
vilket matchar de två första. Byt när du vill:

```bash
git config --local user.name "Erik Gundersen"
git config --local user.email "111501790+gundersenerik@users.noreply.github.com"
```
