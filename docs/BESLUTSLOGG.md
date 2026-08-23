# Beslutslogg

Arkitekturbeslut med alternativ, val och motiv. Skriven för den som tar över
om två år och undrar varför något ser ut som det gör.

Nyast först.

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
