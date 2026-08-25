# CLAUDE.md

Orientering för en Claude-instans som tar vid i det här projektet.

Läs den här filen först. Läs sedan `docs/MASTER-PROMPT.md` — den är
uppdraget. Den här filen är hur arbetet faktiskt bedrivs.

---

## Vad projektet är

Ny digital plattform för **Stora Sundby GOIF**, en ideell idrottsförening i
Södermanland, grundad 14 juni 1925. Runt 200–400 medlemmar och en handfull
volontärer som sköter allt på fritiden.

Ersätter en tolvsidig Hemsida24-sajt på 6 609 tecken med en komplett
föreningssajt: innehåll, stuguthyrning med bokning, medlemsportal med
digital betalning, och en webbshopsupplevelse på egen domän.

Stack: Next.js 16 (App Router), TypeScript, Tailwind v4, Supabase, Vercel.

## Var saker finns

| | |
|---|---|
| Repo lokalt | `~/Downloads/StoraSundby-100` |
| GitHub | `gundersenerik/StoraSundby-100`, gren `main` |
| Supabase | projekt `storasundby-100`, ref `levxuggxlfromxjwwcug`, Free, eu-north-1 |
| Vercel | `storasundby-100.vercel.app`, auto-deploy från `main` |
| Gamla sajten | hemtagen i `content/legacy/` — html, text och 28 bilder |

Repot ligger i `~/Downloads`, vilket inte är idealiskt. Föreslå flytt, men
gör den inte utan att fråga — sökvägen används av andra verktyg.

## De fyra kontrakten

All konfiguration bor i `config/`. Detta är projektets bärande idé.

- **`club.ts`** — vad som är sant om föreningen. Org.nr, adress, avgifter,
  sektioner, styrelse, priser.
- **`design.ts`** — designens struktur. Färgroller, skalor, temakontrakt.
  Rollnamnen är bindande, färgvärdena är platshållare.
- **`content.ts`** — innehållstyper, sidkarta, redirects, röstregler.
- **`placeholder.ts`** — `todo()`-registret.

**Absolut regel:** ingen komponent, sida, migration, mejlmall eller
SQL-kommentar får hårdkoda ett klubbfaktum eller ett hex-värde.
`npm run lint:hardcoded` failar bygget vid överträdelse, och den har rätt
även när det känns onödigt. Har den fångat dig är svaret att importera ur
config, inte att lägga till ett undantag.

**Varje osäkert värde wrappas i `todo()`.** Det registreras automatiskt och
hamnar i `docs/SWAP-LIST.md`. Byt värdet, ta bort wrappern, posten
försvinner. Listan kan därför aldrig bli inaktuell.

## Arbetssätt

**En leverans per commit.** Avgränsad, verifierad, pushad. Vi jobbar direkt
på `main` — inga grenar, inga PR:er, tills sajten är publikt synlig.

**Verifiera innan commit, alltid:**

```bash
npm run typecheck        # noll fel
npm run lint:hardcoded   # inget klubbfaktum utanför config/
npm test                 # enhetstester
npm run build            # bygget går igenom
npm run test:e2e         # Playwright + axe-core, kräver .env.local
```

**Skriv aldrig "klart" om ett test inte körts.** Och verifiera rätt sak: att
kontrollera att något står i en konfigurationsfil är inte att kontrollera
att det fungerar. Se fällan om redirects nedan.

**Commit-meddelanden på svenska, utan å/ä/ö.** Terminalen och git-verktygen
hanterar diakriter olika, och historiken ska vara läsbar överallt. Beskriv
*varför*, inte bara vad — särskilt när något visade sig vara fel.

**Uppdatera loggböckerna i samma commit som arbetet:**
`BESLUTSLOGG.md` vid varje arkitekturbeslut, `KALLOR.md` vid varje nytt
faktapåstående, `TILL-KLUBBEN.md` när något kräver ett mänskligt svar,
`LANSERING.md` när något upptäcks som måste göras vid växlingen.

## Vad du aldrig gör

**Hittar på fakta om föreningen.** Historia, meriter, verksamhet — inget
publiceras utan källa i `KALLOR.md`. Kort och sant slår långt och påhittat.
Påhittade *siffror* är däremot tillåtna, om de wrappas i `todo()`.

**Publicerar ett platshållarvärde.** Organisationsnumret står som
`802XXX-XXXX`. Ett sådant värde i strukturerad data eller i sidfoten är
värre än inget. Utelämna hellre fältet.

**Skriver om rösten till marknadsföringsspråk.** Föreningen är en byförening
i Södermanland, inte ett varumärke. Förbjudna ord står i `content.ts` och
testas automatiskt. Föreningens egna fraser — "våra fina gräsplaner", "alla
gör nytta", "tveka inte, hör av er" — återanvänds ordagrant.

**Öppnar skrivning i databasen utan RLS-policy.** Spärren är alltid RLS,
aldrig en kontroll i koden. En kontroll i en server action är ett lager som
kan glömmas vid nästa action, och ett lager man tror finns är farligare än
inget lager alls.

## Fällor som redan kostat tid

Alla upptäckta i det här projektet. Läs dem, de är billigare än att hitta
dem igen.

**Redirects med å och ä matchar aldrig okodade.** Next matchar mot den
procentkodade sökvägen. `source: "/läger"` hamnar i `routes-manifest.json`,
ser korrekt ut och gör ingenting. Använd `encodeURI()`. Jag verifierade
manifestet och drog fel slutsats — testa alltid mot en riktig begäran.

**Tailwind trädskakar bort tokens.** `@theme inline` krävs för färger,
annars fryser mörkt läge. `@theme static` krävs för resten, annars försvinner
tokens som bara refereras dynamiskt, som `var(--text-${steg})`. Första bygget
tappade hela typskalan utan att något kommando klagade.

**Opacity förstör kontrast.** `opacity: 0.65` på en rad sänkte texten till
2.62:1 mot kravet 4.5:1. Använd aldrig opacity för att signalera tillstånd.

**Träningstider är `time`, inte `timestamptz`.** Ett pass 19.00 är 19.00
året om. Som tidpunkt i UTC flyttar det sig vid sommartidsskiftet. Kravet på
`timestamptz` gäller händelser — bokningar, matcher, betalningar.

**CHECK-villkor hoppas över tyst vid NULL.** En jämförelse med NULL ger NULL,
vilket en CHECK behandlar som uppfylld. Gäller även exclusion constraints på
bokningar i modul 3. Sätt `NOT NULL` eller villkora på status.

**`getUser()`, aldrig `getSession()`.** `getSession()` läser cookien utan att
verifiera den och släpper igenom en förfalskad session.

**En genererad fil får inte innehålla dagens datum.** `swap-list` stämplade
in "Senast genererad", vilket gjorde att filen ändrades varje dygn även när
ingenting rörts — och CI-kontrollen som jämför genererat mot committat föll
vid nästa midnatt. En kontroll som failar av skäl som inte har med det den
bevakar att göra blir ignorerad.

**`git add -A` är förbjudet.** Kör `git status` före varje commit och lägg
till namngivna filer. Connectorer är kontoövergripande: en annan session med
samma verktyg kan skriva till både repot och databasen utan att du vet om
det. Det har redan hänt en gång — commit `207a453` innehåller 981 rader från
en parallell session, felmärkta under ett meddelande om en enda fil.

**Auth-konfigurationen är inte kod.** Site URL och Redirect URLs finns bara i
Supabases dashboard. En adress utanför tillåtelselistan ger inget
felmeddelande — användaren skickas tyst till Site URL.

**Oscopat `getByRole("alert")` träffar Nexts route-announcer.** Next lägger
en egen tom `role="alert"`-div på varje sida, så Playwrights strikta läge
faller med två träffar. Skopa till formuläret eller raden, som admin-specen
gör.

**Att räkna gröna rader är inte att läsa exitkoden.** `grep -c "^✓"` på
databasbeviset visade 20 och dolde både en röd rad och exitkod 1 — CI fick
fånga det lokala körningen släppt igenom. Efter en pipe är `$?` dessutom
sista kommandots kod, inte testets: läs `${PIPESTATUS[0]}`.

## Nuläge

Byggt: fundament, designtokens, publikt träningsschema, sex sektionssidor,
startsida, admin med magisk länk, inline-redigering av träningstider,
massåtgärder som databasfunktioner, säsongsbyte och kopiering, redigering
av sektionstexter, JSON-LD, sitemap, robots, 404, redirects, keep-alive,
nattlig databasbackup (väntar på secreten SUPABASE_DB_URL), hela
uthyrningen: publik sida med tillgänglighetskalender, förfrågningsflöde,
kansli-admin med spärrar, fyra mejlmallar och nyckelskyddad iCal-feed,
samt nyheter och kalender: publika /nyheter, /nyheter/[slug] och /kalender
med NewsArticle/SportsEvent-JSON-LD, admin för utkast → publicera →
avpublicera och händelser med dölj-läge, Aktuellt på startsidan, nyhets-
slugs i sitemap. En nyhets slug sätts vid skapandet och ändras aldrig —
delade länkar får inte dö. Utkast och dolda händelser når aldrig
läsklienten (RLS, bevisat i tests/db sektion 9). Därtill föreningssidorna
/om-foreningen, /kontakt, /anlaggningen och /lager ur belagda källor:
styrelsen visas inte förrän namnen är riktiga (club.board.members-todo),
och kontaktformuläret visas bara när RESEND_API_KEY finns — annars
mejluppmaning. /lager var redirectmålet för gamla /läger men var en 404
tills nu. /bli-medlem finns som informationssida med belagda avgifter och
dagens betalrutin — portalflödet väntar på personnummerfrågan.
Dubbelbokningsskyddet är en exclusion-constraint plus korsöverlapps-trigger
i databasen, bevisad med parallella transaktioner i `npm run test:db` och i
CI mot en Postgres-servicecontainer.

Priser visas INTE förrän todo()-wrappern kring `club.rental.prices` är
borta — `priserArPlatshallare()` gatar sida, formulär och mejl. Samma
mekanik som gör att organisationsnumret (numera hittat: 818000-3694,
bekräftat i två källor) höll sig ur strukturerad data tills det fanns.

Testat: 74 enhetstester, ~170 E2E i mobil och skrivbord, 29
databaspåståenden mot riktig Postgres, axe-core utan allvarliga fel på
samtliga publika och inloggade vyer inklusive uthyrningen, nyheterna och
kalendern.

Dokumenterat: `TILL-KLUBBEN`, `BESLUTSLOGG`, `KALLOR`, `KOSTNADER`,
`LANSERING`, `DRIFT`. Kvar att skriva: `GDPR.md`, som väntar på svaret om
personnummer.

Ej byggt: medlemsportal, webbshop, historik.

**Åtta lanseringsblockerare** står kvar i `SWAP-LIST.md`.
`npm run swap-list:strict` vägrar produktionsdeploy tills de är lösta.

**Det som låser upp mest just nu är inte kod utan två mejl.** Tifosi om
produktfeeden och kansliet om stugpriserna, båda färdigskrivna i
`TILL-KLUBBEN.md` bilaga 1 och 2. Uthyrningen kan inte byggas klar utan
priser och antal stugor. Medlemsportalen hänger på om personnummer krävs —
räcker födelseår försvinner kryptering, adminroller och halva GDPR-arbetet
ur uppdraget.

## Så skrivs testerna

Konventionerna nedan är inte stilfrågor. Var och en kom av ett fel som
kostade tid.

**Egen fixtur, aldrig den riktiga datan.** Test som muterar `okand-2026`
sänker de publika testerna. Skapa en egen säsong med unikt namn i
`beforeEach` och riv den i `afterEach`.

**Sparad session, inte inloggning per test.** `auth.setup.ts` loggar in en
gång och sparar tillståndet; testfiler använder `test.use({ storageState:
ADMIN_STATE })`. Loggar varje test in för sig blir det trettio auth-anrop
per körning, Supabase stryper dem, och resultatet ser ut som slumpmässig
flakighet. Bara test som byter identitet loggar in själva.

**Testa flödet, inte att komponenten renderar.** Kan en ledare faktiskt
flytta ett pass, och syns det publikt?

## Vad som kräver en människa

Stanna och fråga om beslutet innebär att pengar rör sig, att personuppgifter
behandlas på ett nytt sätt, att ett faktapåstående publiceras utan belägg,
att tredjepartsvillkor riskerar att brytas, eller att en gammal URL slutar
fungera.

Skapa aldrig molnresurser, ändra aldrig säkerhetsinställningar och lägg
aldrig till en administratör utan att fråga först.

Erik är direkt och vill att fel ägs tydligt utan att mjukas upp. Han vill ha
kontroll över vad som händer, så beskriv avsteg rakt ut i stället för att
låta dem passera i en commit.
