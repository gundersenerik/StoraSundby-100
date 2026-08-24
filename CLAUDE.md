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

**Auth-konfigurationen är inte kod.** Site URL och Redirect URLs finns bara i
Supabases dashboard. En adress utanför tillåtelselistan ger inget
felmeddelande — användaren skickas tyst till Site URL.

## Nuläge

Byggt: fundament, designtokens, publikt träningsschema, sex sektionssidor,
startsida, admin med magisk länk och inline-redigering av träningstider,
JSON-LD, sitemap, robots, 404, redirects.

Testat: 23 enhetstester, 96 E2E-körningar i mobil och skrivbord, axe-core
utan allvarliga fel.

Ej byggt: nyheter, kalender, uthyrning, medlemsportal, webbshop,
sektionsredigering i admin, massåtgärder i schemat, historik.

**Nio lanseringsblockerare** står kvar i `SWAP-LIST.md`.
`npm run swap-list:strict` vägrar produktionsdeploy tills de är lösta.

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
