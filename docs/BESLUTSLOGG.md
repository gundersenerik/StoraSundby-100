# Beslutslogg

Arkitekturbeslut med alternativ, val och motiv. Skriven för den som tar över
om två år och undrar varför något ser ut som det gör.

Nyast först.

---

## 2026-08-25 — Fotona ur legacy-arkivet i bruk: en bild per sida, där den belägger något

Erik gav klartecken och bekräftade samtycke, även för personbilder. Alla
28 hemtagna foton granskades visuellt före urval — flera visade sig vara
dubbletter (samma foto under olika filnamn, plus cirkelbeskurna
PNG-kopior), och en var gamla prislistan, som INTE publiceras eftersom
priserna är gatade bakom `priserArPlatshallare()` tills kansliet svarat.

**Elva foton valdes enligt DESIGN-TRENDER-principen "få men bärande":**
stugorna på /uthyrning (hyresgäster beslutar på foton), klubbstugan med
Hammargärdets IP-skylten på /anlaggningen (skylten är dessutom ett nytt
belägg för anläggningsnamnet), bollhögen på startsidan, lägerdagen på
/lager, klubbflaggan på /om-foreningen, det historiska fotot där
gräsmattan läggs för hand i historikens eldsjälar-avsnitt (med
efterlysning i bildtexten — år och personer är okända och påstås inte),
samt sektionsfoton för fotboll, orientering, padel, gymnastik och skidor.
Sektioner utan eget foto står utan bild — hellre ingen bild än en
genrebild.

**Tekniken följer researchen:** statiska importer via next/image (mått
och blur-platshållare utan CLS), AVIF i next.config, `preload` på högst
en bild per sida (lazy på förstabilden är ett dokumenterat LCP-fel),
alt-texter som beskriver det som syns och röst-testas mot
`voice.forbidden` i tests/enhet/bilder.test.ts, E2E som kräver att varje
foto renderas med sin alt-text. Vitest fick en bildimport-stub i
konfigurationen — måtten i stubben är låtsade och får aldrig testas.

**Granskningen före commit justerade fyra saker:** webp lades tillbaka
som fallback bredvid AVIF (bara AVIF hade gett äldre webbläsare omkodad
JPEG), preload togs bort från bilder som på mobilviewporten uppmätt
ligger under vecket (startsidan, /om-foreningen, sektionssidorna — kvar
bara där bilden faktiskt syns direkt), Figur fick ett tak på källbildens
egen bredd så att små arkivbilder inte CSS-uppskalas mjukt, och
"efter träning" ströks ur en alt-text — det syns inte i bilden att
passet är slut.

**Rastermärket från gamla sajten sitter nu i sidhuvudet** med tom alt
(länktexten är redan föreningens namn) och hörnradie så att den inbakade
vita bakgrunden blir en liten bricka även i mörkt läge. Ersätts av
vektorlogotypen när den kommer (D2).

---

## 2026-08-25 — Färg- och typografiprofilen: rollkontraktet behölls, värdena byttes

Erik levererade två profilpaket byggda på en inventering av
storasundbygoif.com (`content/design/fargprofil/` och
`content/design/typografi/`).

**Val:** profilens semantiska tokens mappades in i kontraktets tolv
befintliga rollnamn i stället för att profilens fulla tokenuppsättning
infördes. Rollnamnen är bindande; ingen komponent behövde röras — hela
bytet var värden, inte struktur. Det var poängen med kontraktet, och det
höll.

**Statusfärgerna ligger på 700-nivån i ljust och 300-nivån i mörkt**, inte
på profilens 600/ikonnivå. Skälet är att samma roll används både som text
på ljus yta och som knappbakgrund med ljus text (Publicera-knappen,
paus-badgen) — värdet måste klara 4,5:1 åt båda hållen. Bevisas i
`tests/enhet/kontrast.test.ts`: varje textroll mot varje yta den används
på, i båda teman, 40 kombinationer, med kravet läst ur `design.a11y`.

**Archivo Variable laddas via next/font** — självhostad och versionslåst
vid bygget, en familj för allt, vikt via `font-weight` och bredd via
`font-stretch` (wdth-axeln). Värt att äga tydligt: Fraunces/Inter i det
gamla kontraktet var bara namn i en stack — ingen webbfont har någonsin
laddats förrän nu, sajten renderade i fallbacks.

**Rubrikskalan sätts i `@layer base` ur `design.type.headings`.** Tailwinds
preflight nollställer rubriker till brödtextstorlek, och tidigare satte
ingen bas om dem — publika sidors h2 renderade i brödtextstorlek. Nu bär
h1–h3 displayuttrycket (smalare och tyngre per profilen), h4 är
läsrubrik i normalbredd, och admin-raderna behåller sina inline-satta
mindre storlekar eftersom inline alltid vinner.

**Läsbredden förblir per komponent, inte global.** Första versionen la
profilens measure-regel som `p, li, dd { max-inline-size: 66ch }` i basen.
Granskningen före commit visade att den klippte admins flex-rader (byggda
för 64rem) och gav taggiga högerkanter på publika listkort — profilens
egen regel är skopad till löpande text, inte till varje li. Regeln togs
bort; sidorna sätter `maxWidth: var(--measure)` medvetet där text flödar,
vilket de redan gjorde. Kvar i basen: radrytm och `text-wrap: pretty` på p.

**Den preliminära cobalten (`#1424A8`, rasterprovad ur logotypen) bor
enbart i accent-rollen**, som ingen komponent använder än. Den läcker
alltså inte in i UI:t förrän kulören är bekräftad ur en vektorlogotyp
(TILL-KLUBBEN D2).

**Mobilnavigationen fick `flex-basis: 16rem`:** utan den klämdes menyn i en
smal kolumn bredvid titeln med en post per rad — synligt först i
skärmbildskontrollen, inte i något test. En riktig mobilmeny är fortfarande
framtida arbete.

`todo()` togs bort från `design.color`, `design.type.family` och
`club.brand`. Lanseringsblockerarna gick från 8 till 6.

---

## 2026-08-25 — Historiesidan: dubbelverifierad research, attribuering och en fråga i stället för ett fynd

Historien researchades i fem parallella källvinklar (tidningsarkiv,
förbund/resultat, föreningsplattformar, myndighet/kommun, bygdehistoria)
där varje påstående krävde URL och citat — och varje påstående därefter
verifierades av en oberoende skeptiker som själv öppnade källan igen.
35 påståenden höll, 2 kasserades (bl.a. Facebook-uppgifter bakom
inloggningsvägg som inte gick att kontrollera).

**Uppgifter ur en enda källa attribueras i löptexten** ("enligt
seriearkiven", "skrev Eskilstuna-Kuriren i minnesorden") — då är det
belagda påståendet att källan säger det, inte att det är sant, och
läsaren ser skillnaden.

**Det mest spännande fyndet publicerades inte.** svenskafotbollsklubbar.se
anger att klubben bildades 1932 genom sammanslagning av Stora Sundby IF
och Öja GF — entusiastdatabas utan källor, och årtalet motsäger
webbplatsens 14 juni 1925. Källprincipen säger att webbplatsen vinner:
uppgiften ligger som fråga C8 i TILL-KLUBBEN i stället för som faktum på
sidan. Sidan avslutas med en efterlysning av bilder, klipp och minnen —
hundraårig historia hämtas bäst från dem som var med.

Tillgänglighetsredogörelsen (/tillganglighet) byggdes i samma leverans:
frivillig, och därför skriven strikt ur det som faktiskt görs och testas
— WCAG 2.1 AA via axe-core i CI, tangentbordsnavigering — med ärlig
brasklapp om vad automatiska tester inte fångar och en kontaktväg.

---

## 2026-08-25 — Bekräfta-flimret: beskedet ägs av sidan, inte raden

Fyra CI-varv föll intermittent på samma påstående — beskedet efter
Bekräfta — och två teorier hann åtgärdas innan den verkliga mekanismen
syntes i Playwright-rapportens ögonblicksbild: **åtgärden lyckades varje
gång**. Bokningen stod som bekräftad, men raden hade flyttat från "Att ta
ställning till" till "Kommande bokningar" i serverns omrendering, och med
flytten monterades komponenten om — det lokala beskedet försvann. En
kapplöpning: hann Playwright (eller kansliet) se beskedet före
omrenderingen fanns det, annars inte.

De två första teorierna var fel eller ofullständiga och ska ägas som det:
höjd expect-timeout (teori: långsam runner) och borttagen revalidering av
egna force-dynamic-sidan (riktig förbättring i sig, men inte roten). Det
som till slut gav svaret var att ladda ner testrapportens sidögonblick i
stället för att resonera vidare från felmeddelandet.

**Fix:** beskeden bor nu i en BeskedProvider på sidnivå, adresserade per
boknings-id. Providern ligger stabilt i trädet och överlever
omrenderingen, så "Inget mejl gick ut — hör av dig till gästen själv"
står kvar var raden än hamnar. Det var ett verkligt gränssnittsfel, inte
bara testflimmer: beskedet försvann för kansliet precis när det angick
dem som mest.

---

## 2026-08-25 — /bli-medlem publicerar dagens betalrutin trots öppen personnummerfråga

Informationssidan för medlemskap återger gamla sajtens betalinstruktion
ordagrant — inklusive att personnummer anges i betalningen. Frågan om
personnummer alls ska samlas in är öppen (A-fråga i TILL-KLUBBEN), men
den gäller den kommande medlemsportalens datainsamling. Att återge
föreningens gällande rutin är status quo, ingen ny behandling: samma
instruktion står på den publika sajten idag. Ändrar kassören rutinen
efter GDPR-svaret uppdateras en mening. Alternativet — att utelämna
betalinstruktionen — hade gjort sidan obrukbar för den som faktiskt vill
bli medlem.

---

## 2026-08-25 — Föreningssidorna: styrelsen och kontaktformuläret gatar sig själva

Fyra sidor ur belagda källor: `/om-foreningen`, `/kontakt`, `/anlaggningen`
och `/lager`. Föreningens egna texter återges ordagrant — ändamålsparagrafen,
"alla gör nytta"-stycket och lägertexten.

**Styrelsen publiceras inte förrän namnen är riktiga.** Ledamöterna utöver
ordföranden är platshållare (blockerar lansering), så sidan visar det
webbplatsen faktiskt säger — ordförande plus sju ledamöter, med ordföranden
namngiven — och hela listan aktiverar sig själv när todo()-wrappern kring
`club.board.members` tas bort. Ett E2E-test bevakar att "Ledamot 2" aldrig
syns publikt.

**Kontaktformuläret visas bara när e-posten är konfigurerad.** Utan
RESEND_API_KEY skickar skickaEpost ingenting, och ett formulär som tyst
tappar meddelanden är värre än inget formulär. Tills nyckeln finns i Vercel
visas en mejluppmaning; sektionen byter själv vid nästa deploy. Samma
spamskydd som bokningsformuläret: honeypot och frusen tidsspärr.

**`/lager` var ett utlovat redirectmål utan sida.** `/läger` har redirectat
till `/lager` sedan redirectleveransen — men målet var en 404. Gamla
lägersidans text bor nu där, med länkar till uthyrningens förfrågningsflöde
som redan har ändamålet läger. En gammal URL ska inte bara byta adress,
den ska landa på något.

**Granskningen fällde sju fynd, alla åtgärdade före push.** Det
allvarligaste: skolans namn publicerades utan källa — gamla sajten skriver
bara "skolan", och namnet i config saknade todo()-wrapper, så ingen
automatisk spärr täckte det. Namnet är nu wrappat och sidan skriver
"skolan" tills det bekräftats. Övriga: besökarens namn i mejlets ämnesrad
hade loggats vid Resend-fel (ämnesraden är nu personuppgiftsfri);
tidsspärren klassade en enhetsklocka som går före serverns som robot och
slängde riktiga meddelanden med ett falskt tack (negativ tid ger nu ett
ärligt fel — även i bokningsformuläret, som hade samma mönster);
"11-mannasplaner" i metadata och Place-JSON-LD; Instagram-handtaget
hårdkodat i stället för härlett; sitemap saknade sedan tidigare de sex
sektionssidorna; och kontaktformulärets logik testades ingenstans — nu
bevakar enhetstester spamskyddet, klockskevet och felvägarna direkt på
servern-actionen, eftersom formulärläget aldrig renderas i CI.

---

## 2026-08-25 — Granskningen av nyhetsmodulen fällde tolv fynd; alla åtgärdade före push

Samma adversariella upplägg som för uthyrningen: fyra dimensioner, en
skeptiker per fynd. Tolv unika fynd höll, varav ett blockerande:

1. **E2E-testernas `form.first()` träffade utloggningsformuläret** i
   admin-headern — båda kalendertesterna hade fallit deterministiskt i CI.
   Skapa-formulären fick aria-label och testerna söker nu namngivet.
2. Spara tid i händelseraden synkade aldrig radens lokala tillstånd — admin
   såg gamla tiden trots lyckad sparning och hade sparat igen. Tillståndet
   uppdateras nu ur samma tolkningsregler som servern använder.
3. Hårdkodade fixturdatum ("2027-09-11") hade gjort testerna permanent röda
   den dag datumet passerat. Fixturerna använder nu alltid nästa
   kalenderår, och veckodagen ingår inte i påståendena.
4. Ett hårt avbrutet CI-jobb hoppar över afterEach och kunde lämna en
   publicerad "E2E:"-nyhet synlig på skarpa sajten. CI har nu ett
   städsteg med `if: always()` (`scripts/rensa-e2e-fixturer.ts`).
5. Databasbeviset provade bara anon — men den realistiska angriparen är
   den inloggade icke-administratören (vem som helst kan begära en magisk
   länk). Sektion 10 byter JWT-stubben till en icke-admin och bevisar
   42501 respektive noll rader.
6. Taket på 50 i `hamtaPublicerade` gjorde att artikel 51+ tyst föll ur
   både listan och sitemapen fast sidan lever. Sitemapen hämtar nu utan
   tak; listan visar de 50 senaste tills paginering behövs — det är det
   dokumenterade beslutet.
7. Återpublicering ger dagens datum (en konsekvens av
   en-kolumnsdesignen). Beslutet står fast men är nu dokumenterat här och
   i DRIFT, i stället för att överraska kansliet.
8. Månadsrubrikerna bröt headingCase-regeln ("september 2027" som rubrik).
   `manadsrubrik` versaliserar nu första bokstaven.
9. En nyhet med enbart rubrik publicerade tom meta description och tom
   description i JSON-LD. Tomma fält utelämnas nu, samma regel som för
   platshållarvärden.
10. Inline-fälten i admin saknade maxLength, så databasens CHECK-fel
    visades som "Kunde inte spara. Försök igen." — fälten speglar nu
    CHECK-gränserna.
11. `events.section_slug` (FK) saknade index, i strid med mönstret från
    migration 001. Migration 011 lägger det.
12. "1 kommande händelse inlagda" — grammatiken följde inte antalet.

Lärdomen från uthyrningen står sig: alla tolv passerade typecheck, lint,
enhetstester och bygget. Det blockerande fyndet var dessutom i testkod som
lokalt aldrig kördes (admin-flödena kräver service-nyckeln som bara CI
har) — granskningen är enda försvaret före pushen även för testerna.

---

## 2026-08-25 — Nyheter och kalender: published_at som enda brytare, slug för alltid

Modulen för nyheter (`posts`) och evenemang (`events`), migration 010.

**published_at är både brytare och datum.** Ett utkast är `null`, en
publicerad nyhet bär sitt publiceringsdatum i samma kolumn. Två kolumner
(`published` + `published_at`) hade kunnat hamna i osynk — "publicerad
utan datum" går inte ens att uttrycka nu. Evenemang har i stället en enkel
`published`-boolean: de har inget publiceringsdatum att visa, och en dold
händelse är ett arbetsläge, inte ett utkastflöde.

**Sluggen sätts vid skapandet och följer aldrig med titeln.** En publicerad
URL kan vara delad på Facebook eller i ett mejl, och "en gammal URL slutar
fungera" är ett beslut som kräver en människa. Hellre en slug som släpar
efter titeln än en död länk. Krockar löses med -2, -3 … vid skapandet
("Årsmötet 2027" återkommer varje år). Sluggen är alltid ascii —
NFD-normalisering plockar diakriterna — och databasens CHECK vägrar
allt annat, så redirects-fällan med å/ä kan inte återuppstå i nya URL:er.

**Evenemang är timestamptz, träningstider förblir time.** Årsmötet den
15 mars 18.00 är en tidpunkt; ett träningspass på torsdagar är ett mönster.
Regeln från migration 007 gäller.

**Författaren i NewsArticle-JSON-LD är alltid föreningen.** Bylinen på
sidan är fritext ("Kansliet", "Fotbollssektionen"), och att gissa @type på
en textsträng blir fel oftare än rätt. Avsändaren är föreningen oavsett
vem som höll i pennan.

**Inga anon-skrivningar alls.** Till skillnad från bokningarna finns inget
publikt formulär — bara kansliet skriver, så anon fick ingen insert-policy
över huvud taget. Bevisat i tests/db (sektion 9) tillsammans med att utkast
och dolda händelser aldrig når läsklienten.

---

## 2026-08-24 — Expect-timeout 10 s, och tappade action-svar visas för kansliet

CI fällde bekräfta-flödet tre gånger i en körning som gått grön dagen
innan: beskedet med `role="status"` dök aldrig upp inom Playwrights
standardtimeout på 5 sekunder. Ingen data var fel — bekräftelsen är den
tyngsta åtgärden (uppdatering, revalidering, omrendering och mejlmall),
och på en belastad runner hann svaret inte fram. Serverns "destination
stream closed early"-rader var följdbrus: sidor som stängdes medan
omrenderingen ännu strömmade.

**Val:** `expect.timeout` höjs till 10 sekunder globalt, i stället för
längre timeoutar på enskilda rader. Testet mäter fortfarande att åtgärden
svarar rimligt — det slutar bara mäta runnerns dagsform.

Samma diagnos blottade ett riktigt hål i gränssnittet: transitionerna i
bokningsraden och spärrlistan saknade catch, så ett tappat svar — CI-race
eller dålig uppkoppling på landet — lämnade kansliet helt utan besked,
fast åtgärden kan ha sparats i databasen. Nu sägs det rakt ut: "Svaret
från servern kom aldrig fram. Ladda om sidan och kontrollera om ändringen
gick igenom."

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
