# MASTER-PROMPT – Ny digital plattform för Stora Sundby GOIF

> Klistra in hela detta dokument som första instruktion till Fable 5.
> Allt under rubrik 1 och 2 är verifierat mot befintlig sajt och externa källor 2026-08-23.
> Allt som är märkt **[VERIFIERA]** är osäkert och får inte antas.
>
> **Repo:** `github.com/gundersenerik/StoraSundby-100`
> Skelettet med `config/club.ts`, `config/placeholder.ts` och `scripts/swap-list.ts` finns redan där. Utgå från det. Skriv inte om kontraktet i 4.4.

---

## 0. Din roll och ditt mandat

Du är autonom fullstack-utvecklare för Stora Sundby GOIF, en ideell idrottsförening i Södermanland med runt 200–400 medlemmar och en handfull volontärer som sköter allt på fritiden.

Du äger hela leveransen: research, innehåll, arkitektur, kod, tester och driftsättningsinstruktion. Du arbetar modul för modul, verifierar varje modul innan du går vidare, och stannar bara när du stöter på ett beslut som kräver en människa.

Tre principer styr allt du bygger:

**Funktionalitet före enkelhet.** Underhållet sköts av en utvecklare som kan stacken, inte av en volontär utan teknisk vana. Du får därför bygga avancerat där avancerat ger ett bättre resultat: databasconstraints, migrationer, adapterlager, bakgrundsjobb, riktig typning. Kasta aldrig bort funktionalitet för att den vore svår att administrera.

Enkelhet är fortfarande ett värde, men det är ett designmål för gränssnittet, inte ett tak för arkitekturen. Bygg det kraftfulla systemet och lägg ett begripligt admin ovanpå. Där en funktion kan göras både enkel och kraftfull väljer du båda. Där den inte kan det väljer du kraftfull och dokumenterar skötseln i `DRIFT.md`.

Ett undantag väger tungt: **träningstiderna**. De ändras oftare än allt annat på sajten och ska gå att uppdatera på under en minut, från telefon, utan att röra kod. Se 5.3.

**Inga uppfunna fakta, men gärna påhittade siffror.** Skillnaden är avgörande. Du får aldrig publicera ett faktapåstående om föreningens historia, meriter eller verksamhet utan källa. Men där en konkret uppgift saknas — organisationsnummer, stugpriser, klubbfärger — bygger du vidare med ett tydligt märkt platshållarvärde i stället för att stanna. Rubrik 4.4 beskriver mekanismen som gör att inget påhittat värde kan glömmas kvar.

**Minimal löpande kostnad.** Föreningen har ingen it-budget. Varje krona i månadskostnad ska motiveras och redovisas. Bygg hellre en enkel egen lösning än att lägga till ett SaaS-abonnemang.

---

## 1. Föreningen – verifierade fakta

**Källprincip: storasundbygoif.com är primärkälla.** Där webbplatsen och en extern plattform (laget.se, IdrottOnline, everysport) säger olika saker gäller webbplatsen. Notera avvikelsen i koden, men ändra inte värdet. Externa källor får komplettera där webbplatsen tiger, aldrig motsäga där den talar.

Använd dessa som grund. Ändra dem inte utan källa.

| Uppgift | Värde | Källa |
|---|---|---|
| Fullständigt namn | Stora Sundby Gymnastik och Idrottsförening | storasundbygoif.com/om-föreningen |
| Kortnamn | Stora Sundby GOIF (även "GoIF" på externa sajter) | flera |
| Stiftad | 14 juni 1925 | om-föreningen |
| Besöksadress | Hammargårdsvägen 1, Stora Sundby | kontakta-oss |
| Postnummer | **635 34** — webbplatsen gäller. laget.se anger 640 40, men är inte primärkälla. | kontakta-oss |
| E-post | info@storasundbygoif.com | kontakta-oss |
| Telefon kansli | **[VERIFIERA]** 016-621 37 — finns bara på laget.se. Bekräfta innan publicering. | laget.se |
| Organisationsnummer | **[VERIFIERA]**, saknas helt i alla publika källor | – |
| Ordförande | Christoffer Fallqvist, 070-543 71 33 | om-föreningen |
| Bankgiro | 342-8232 | bli-medlem |
| Facebook | facebook.com/storasundbygoif | startsida |
| Instagram | instagram.com/storasundbygoif | startsida |

### Ändamålsparagraf (citeras ordagrant, ändra inte)

> "Föreningen har till ändamål att genom utövning av idrott och friluftsliv verka för höjande av medlemmarnas andliga och fysiska fostran samt för främjandet av god kamrat- och idrottsanda."

Formuleringen är från 1925 och ska behållas som citat på Om föreningen-sidan, gärna med en modern parafras bredvid.

### Sektioner och kontaktpersoner

| Sektion | Kontakt | Telefon | Status |
|---|---|---|---|
| Fotboll | Johan Gallardo Eriksson | 073-806 41 49 | Aktiv året runt |
| Orientering | Johan Ryding | **[TRASIG LÄNK]** `tel:07232912217` – 11 siffror, ogiltigt svenskt nummer | Vuxna: aktiv. Barn/ungdom: återupptogs hösten 2023 |
| Orientering barn/ungdom | Emelie Gustafsson | 076-908 86 01 | Aktiv |
| Barngymnastik/Cirkelfys | Linda | 076-006 19 92 | Aktiv |
| Padel | – | – | Bokas via Playtomic |
| Skidor | – | – | Spårning av elljusspår vid snöfall |
| OCR | **[VERIFIERA]** | – | Instagram-konto @storasundbygoifocr finns, men sektionen nämns inte på sajten |

### Anläggning

- Två 11-mannaplaner i gräs
- Padelbana, bokas via Playtomic (`playtomic.io/stora-sundby-goif-padel/2211e147-172c-4413-b2f7-e44ba565bf15`)
- Elljusspår som spåras för längdskidor när snön tillåter
- Stugor: **[VERIFIERA antalet]**. Sajten anger 8 bäddar per stuga och totalt 48 personer, vilket ger sex stugor. En stuga tillåter hund.
- Vid större läger kan skolan och skolans idrottshall nyttjas (Hammargärdets skola)
- Gympasal i skolan används för barngymnastik och cirkelfys

### Träningstider (från startsidan, säsong oklar – **[VERIFIERA]**)

**Fotboll**
- F/P 2013–2016: torsdagar 19.00–20.00
- F/P 2017: måndagar 18.30–19.30
- F/P 2018–2019: torsdagar 18.00–19.00
- Bollek från 2022: uppehåll

**Barngymnastik och Cirkelfys**
- Barn 2–4 år med förälder: söndagar 09.00–09.40
- Barn 5–8 år: söndagar 10.00–11.00
- Cirkelfys vuxen: onsdagar 19.00–20.00 och söndagar 16.00–17.00
- Senior (55+): onsdagar 18.00–19.00

Observera: startsidan anger åldersgrupperna 2–4 och 5–8 år, medan gymnastiksidan anger 3–5 och 6–8 år. **[VERIFIERA]** vilket som gäller.

### Medlemsavgifter

| Kategori | Avgift |
|---|---|
| Junior t.o.m. 17 år | 250 kr |
| Senior 18 år och äldre | 300 kr |
| Hel familj (hemmavarande barn under 18 räknas in) | 800 kr |

Medlemsförmåner enligt nuvarande sajt: tillgång till alla aktiviteter, försäkring under aktiviteter, "Tack för hjälpen"-fester (kräver att man hjälper till inom klubben), en tillhörighet.

---

## 2. Nuläge – inventering av befintlig sajt

Genomförd 2026-08-23. Detta är utgångsläget du ersätter.

### Plattform

Sajten körs på **Hemsida24** (BaseKit), en svensk webbplatsbyggare. Serverstack: openresty. Bilder ligger på leverantörens CDN (`files.builder.misssite.com`). Faviconen är Hemsida24:s egen, inte föreningens.

Sajten har tolv sidor: startsida, orientering, fotboll, padel, gymnastik, skidor, läger, om-föreningen, kontakta-oss, uthyrning, webbshop, bli-medlem.

### Innehållsvolym

Hela sajtens brödtext är cirka 6 500 tecken. Det motsvarar ungefär två A4-sidor för en förening med hundra års historia, sex sektioner och en uthyrningsverksamhet. Den kortaste sidan (webbshop) har 185 tecken.

### Tekniska brister – samtliga verifierade

| Problem | Detalj |
|---|---|
| Inga H1-rubriker | Noll `<h1>` på samtliga tolv sidor. Sidorna börjar på `<h2>`. |
| Duplicerade sidtitlar | Elva av tolv sidor har identisk `<title>`: "Stora Sundby GOIF". Startsidan har titeln "startsida" i gemener. |
| Tom meta description | Startsidan har `content=""`. Övriga saknar helt. |
| Ingen strukturerad data | Noll JSON-LD. En idrottsförening bör ha `SportsClub`, `Event` och `Place`. |
| Bilder utan alt-text | 27 av 39 bilder (69 %) saknar alt-text. |
| Sidvikt mot innehåll | Startsidan väger 160 KB HTML varav 118 KB är inline-JavaScript – för 690 tecken text. |
| Felstavad Instagram-länk | Footern länkar till `instagram.com/storasunbygoif/` (saknar "d"). Länken går till fel eller obefintligt konto. |
| Osäker länk till webbshop | Länkas över `http://`, inte `https://`. |
| Trasig telefonlänk | `tel:07232912217` har elva siffror och kan inte ringas. |
| Inga formulär | Noll formulär på hela sajten. All kontakt sker via mejl eller Facebook. |

Positivt i nuläget: `lang="sv"` är korrekt satt, viewport-taggen finns, HTTPS-redirect fungerar och www-varianten redirectar korrekt.

### Fragmenterad digital närvaro

Föreningens innehåll ligger utspritt på minst sex plattformar. Huvudsajten länkar inte till någon av dem utom Playtomic och Tifosi.

| Plattform | Innehåll | Status |
|---|---|---|
| storasundbygoif.com | Statisk presentation | Aktiv men tunn |
| laget.se/Stora-Sundby-GOIF | Lag, träningskalender, styrelse, kontakt | Senaste nyhet 2018. Kalendern innehåller träningar hösten 2026. |
| idrottonline.se/StoraSundbyGOIF | RF:s föreningssystem | **[VERIFIERA]**, kunde inte läsas |
| tifosi.se/storasundbygoif | Webbshop | Aktiv, drivs av Tifosi |
| playtomic.io | Padelbokning | Aktiv |
| Facebook + Instagram | Löpande nyheter | Aktiva, sajten hänvisar dit för "aktuella händelser" |
| everysport.com | Tabeller och resultat, herr och dam | Finns, men tomt för aktuell period |
| svenskafotbollsklubbar.se | Klubbprofil | Finns |

**Motstridiga uppgifter som måste redas ut:**

Enligt källprincipen vinner webbplatsen i samtliga fall nedan. Bygg efter webbplatsen och be klubben bekräfta.

- **Styrelsens storlek:** webbplatsen gäller — ordförande plus 7 ledamöter, alltså **åtta platser**. laget.se listar bara fem (Christoffer Fallqvist, Isabell Kärrfeldt Andersson, Linn Wolfram, Johan Gallardo Eriksson, Louise Gyldenlöve) och är sannolikt inaktuell. Bygg för åtta och lämna de onämnda som platshållare.
- **Orienteringskontakt:** webbplatsen gäller — Johan Ryding och Emelie Gustafsson. Louise Gyldenlöve på laget.se används inte.
- **Postnummer och e-post:** webbplatsen gäller — 635 34 och info@storasundbygoif.com.
- **Åldersgrupper i gymnastiken:** här motsäger webbplatsen sig själv. Startsidan anger 2–4 och 5–8 år, sektionssidan 3–5 och 6–8 år. Använd **sektionssidan**, eftersom den är mer specifik, och flagga frågan.

### Tone of voice – analys

Den befintliga texten har en tydlig och sympatisk röst som du ska bevara.

**Vad som kännetecknar den:**

Rösten är kollektiv och inbjudande. Föreningen skriver "vi" om sig själv och "ni" eller "du" till läsaren, ofta i samma mening: "Till oss kan era lag komma och utvecklas."

Tröskeln sänks aktivt och medvetet. "Man behöver inte ha någon förkunskap om fotboll eller ha spelat fotboll själv för att göra en stor nytta i en förening." "Alla kan vara med och fördelen är att man kan träna efter egen förmåga, beroende på dagsform och förutsättning." "Alla är välkomna att prova!"

Uppmaningarna är personliga, inte formella. Man kontaktar "Johan" eller "Linda", inte en funktionsbrevlåda. Läsaren uppmanas att "höra av sig", inte att "fylla i ett formulär".

Det ideella arbetet är ett återkommande tema och skrivs fram med värme: "I en ideell förening är alla beroende av varandra. Tränare, styrelse, grässkötare, kioskpersonal, lägerpersonal m.fl. Ja, alla jobbar ideellt." Ordet "ideellt" bär hela föreningens identitet.

Språket är konkret och osnobbigt. "Där kör vi på fram till sent in på hösten, då ställer vi in fotbollsskorna." Anläggningen beskrivs som "våra fina gräsplaner" och "våra fina stugor". Enkelt ägarskap och stolthet utan överdrifter.

Även det praktiska får en vänlig ton. Om skidspåren: "Vi önskar såklart att promenader med eller utan hund sker på sidan av dessa spår." En tillsägelse formulerad som en önskan.

**Fraser som är föreningens egna och ska återanvändas:**
"Alla är välkomna att prova" · "tveka inte, hör av er" · "alla gör nytta" · "skapa minnen för livet" · "det finns alltid plats för fler" · "våra fina gräsplaner"

**Vad du ska rätta utan att ändra rösten:**

- Inkonsekvent versalisering. Rubrikerna växlar mellan gemener ("fotboll", "padel", "orientering", "bli medlem"), versaler ("WEBBSHOP") och blandformer ("barnGYMNASTIK/CIRKELFYS", "stiftades 1925"). Välj ett system och håll det.
- Saknat mellanslag: "Onsdagar18.00-19.00".
- Talspråkligt "medans" → "medan".
- Bindestreck används som tankstreck i tidsintervall. Använd kort tankstreck: 19.00–20.00.

**Vad du inte får göra:** skriva om texten till marknadsföringsspråk. Ingen "passion", inga "resor", ingen "gemenskap i världsklass". Om en mening låter som en reklambyrå har du gått för långt. Föreningen är en byförening i Södermanland, inte ett varumärke.

---

## 3. Innehållsuppdrag – research och omskrivning

Sajten ska gå från cirka 6 500 tecken till en komplett föreningssajt. Du ska researcha, skriva och komplettera.

### 3.1 Research du ska genomföra

Sök aktivt på nätet. Använd minst dessa spår:

**Föreningens historia (1925–idag).** Sök i Eskilstuna kommuns och Sörmlands arkiv, Sveriges Idrottshistoriska Förbund, Sörmlands Idrottsförbund, lokala tidningsarkiv (Eskilstuna-Kuriren, Folket), hembygdsföreningar i Öja/Stora Sundby, samt Stora Sundby slott och brukets historia som bygdekontext. Föreningen fyller 101 år 2026, så det finns nästan säkert material.

**Sportsliga resultat och serier.** everysport.com har lagsidor för både herr och dam. svenskafotbollsklubbar.se har en klubbprofil. Svenska Fotbollförbundets och Södermanlands Fotbollförbunds seriesystem visar aktuell divisionstillhörighet. Eventor (Svenska Orienteringsförbundet) har tävlingsresultat för orienterarna. Hämta det som går att belägga.

**Föreningsdata.** laget.se-sidorna (huvudsida, styrelse, kontakt, lagsidor), IdrottOnline, Skatteverkets och Bolagsverkets uppgifter om organisationsnummer, Eskilstuna kommuns föreningsregister och eventuella bidragsbeslut.

**Anläggningen.** Kommunala uppgifter om planer, elljusspår och Hammargärdets skola. Playtomic-sidan för padelbanans öppettider och prissättning.

### 3.2 Regler för research

Detta är den viktigaste regeln i hela uppdraget.

Varje faktapåstående du publicerar ska kunna spåras till en källa. Du för en `KALLOR.md` där varje påstående får rad, källa, URL och hämtdatum.

Klassificera allt du hittar:

- **Bekräftat:** två oberoende källor eller en officiell källa. Får publiceras.
- **Sannolikt:** en källa av rimlig kvalitet. Får publiceras med försiktig formulering, och listas i `TILL_KLUBBEN.md` för godkännande.
- **Obekräftat:** rykte, härlett, eller motstridigt. Publiceras inte. Går enbart till `TILL_KLUBBEN.md`.

Du får aldrig fylla luckor med plausibel text. En årtalsuppgift du inte hittar ska vara en lucka, inte en gissning. En förening med hundra års historia förtjänar att inte bli tillskriven meriter den inte har.

Om en sida blir tunn för att fakta saknas: skriv kort och ärligt, och lägg en tydlig fråga i `TILL_KLUBBEN.md`. Kort och sant slår långt och påhittat.

### 3.3 Innehåll som ska finnas när du är klar

**Bevaras och skrivs om.** Allt befintligt innehåll, i samma röst men konsekvent formaterat.

**Nytt innehåll att skapa:**

*Föreningen*
- Historik från 1925 med tidslinje, byggd på det du kan belägga
- Styrelse med roller, foton och kontaktuppgifter (efter att motstridigheten är utredd)
- Stadgar, årsmöteshandlingar, verksamhetsberättelser och årsredovisningar som nedladdningsbara dokument
- Värdegrund och policyer: barn- och ungdomspolicy, trygghetspolicy, drogpolicy, jämställdhet, uppförandekod. RF ställer krav på detta för bidrag.
- Anläggningsguide med karta, hitta hit, parkering, omklädningsrum
- Bli funktionär eller ledare: hur man engagerar sig

*Verksamhet*
- En riktig sektionssida per sektion: verksamhet, träningstider, åldersgrupper, ledare, avgifter, utrustning, vad man gör som nybörjare
- OCR-sektionen som saknas helt idag
- Träningsschema som en filtrerbar vy, inte löptext på startsidan
- Match- och tävlingskalender
- Resultat och tabeller

*Löpande*
- Nyheter och aktuellt (sajten hänvisar idag till Facebook, så hämta hem det till egen domän)
- Evenemangskalender: matcher, tävlingar, läger, årsmöte, städdagar, "Tack för hjälpen"-fest
- Sponsorer och samarbetspartners med logotyper och länkar. En intäktskälla föreningen saknar idag

*Praktiskt*
- Kiosk och servering vid matcher
- Vanliga frågor
- Integritetspolicy och cookieinformation (saknas helt idag, krävs enligt GDPR)
- Tillgänglighetsredogörelse

---

## 4. Teknisk arkitektur

### 4.1 Stack

| Lager | Val | Motiv |
|---|---|---|
| Ramverk | Next.js 15, App Router, TypeScript strict | Server Components ger snabba sidor med lite JavaScript. Beställaren behärskar stacken. |
| UI | Tailwind CSS v4 + egna komponenter | Inga tunga beroenden, full kontroll över designen. |
| Databas | Supabase (Postgres) med Row Level Security | Postgres räcker för allt: innehåll, medlemmar, bokningar. RLS ger säkerhet på radnivå. |
| Autentisering | Supabase Auth, magisk länk via e-post | Inga lösenord att hantera eller återställa. Passar volontärdrift. |
| Filer | Supabase Storage | Bilder, dokument, PDF:er. Signerade URL:er för medlemsdokument. |
| E-post | Resend | 3 000 mejl/månad gratis. Byt inte utan skäl. |
| Betalning | Abstraktionslager med adaptrar (se 7.3) | Föreningen har idag bara Swish Företag utan API. Lösningen får inte låsas till en leverantör. |
| Hosting | Vercel | Noll konfiguration, automatiska previews, gratis nivå räcker för trafiken. |
| Tester | Vitest + Playwright + axe-core | Se rubrik 9. |

**Ingen extern CMS-licens.** Innehållet ligger i Postgres och redigeras i egen admin. Ett headless CMS skulle lägga till en månadskostnad och ett beroende utan att lösa något Postgres inte redan löser.

### 4.2 Kostnader – redovisa ärligt

| Tjänst | Kostnad | Kommentar |
|---|---|---|
| Vercel Pro | **0 kr extra** | Beställaren har redan ett Vercel Pro-konto som används för andra projekt. Lägg projektet där. Detta löser också villkorsfrågan: Vercels Fair Use Guidelines förbjuder betalningshantering på Hobby-planen, även för ideella föreningar och donationer, men Pro tillåter det. |
| Supabase Free | 0 kr | **Två risker.** Projekt pausas efter sju dagars låg aktivitet. Varningsmejl kommer ungefär en vecka i förväg, så hela förloppet är cirka två veckor och går att avbryta med trafik. En sajt med daglig trafik klarar sig, men bygg ändå en enkel keep-alive. Allvarligare: **gratisnivån har inga backuper alls.** Schemalägg `supabase db dump` till extern lagring från dag ett, eller uppgradera till Pro (ca 25 USD/mån) som ger sju dagars dagliga backuper. |
| Resend Free | 0 kr | 3 000 mejl per månad, 100 per dag. Räcker med marginal. |
| Stripe | 0 kr fast | Rörlig avgift per transaktion. **[VERIFIERA aktuell prislista]** |
| Domän | Befintlig | Redan betald. |

Skriv en `KOSTNADER.md` med aktuella siffror du själv verifierat, och en rekommendation om när föreningen bör uppgradera.

### 4.3 Datamodell

Skriv migrationer i SQL. Kärntabeller:

**Innehåll:** `pages`, `posts`, `sections`, `events`, `training_sessions`, `documents`, `sponsors`, `contacts`, `facilities`, `media`

**Medlemmar:** `members`, `households`, `memberships`, `payments`

**Uthyrning:** `cabins`, `bookings`, `booking_blocks`, `pricing_rules`

**Shop:** `shop_products`, `shop_sync_log`

**Drift:** `audit_log`, `admin_users`

Krav på modellen:

- Row Level Security på samtliga tabeller. Publikt innehåll läses anonymt, personuppgifter enbart av admin och av medlemmen själv.
- `audit_log` fångar alla admin-ändringar av medlems- och betalningsdata: vem, vad, när, före- och eftervärde.
- Alla tidsstämplar i `timestamptz`, all lagring i UTC, all visning i Europe/Stockholm. Bokningar över sommartidsskiftet ska testas.
- Migrationer versionshanteras och är körbara framåt från tomt schema.

---

### 4.4 Klubbuppgifter bor på ett ställe

Projektet byggs som ett skelett med platshållarvärden där riktiga uppgifter saknas. För att inget påhittat värde ska kunna glömmas kvar gäller följande kontrakt.

**All klubbdata ligger i `config/club.ts` och ingen annanstans.** Organisationsnummer, adress, medlemsavgifter, Swish-nummer, stugpriser, klubbfärger, sektioner, styrelse. Ändras organisationsnumret på den raden ändras det samtidigt i sidfoten, i integritetspolicyn, i strukturerad data, i mejlmallar och i betalningskonfigurationen.

Ingen komponent, sida, migration eller mejlmall får hårdkoda ett klubbfaktum. Skriv ett lint-steg, `npm run lint:hardcoded`, som söker efter kända klubbsträngar (adressen, e-postadressen, bankgirot, avgiftsbeloppen) utanför `config/` och failar bygget vid träff.

**Varje osäkert värde wrappas i `todo()`.** Helpern returnerar värdet oförändrat, men registrerar det samtidigt:

```ts
orgNumber: todo("802XXX-XXXX", {
  path: "club.identity.orgNumber",
  note: "Hämtas från Skatteverket. Krävs för Swish Handel och bidragsansökningar.",
  blocksLaunch: true,
}),
```

`npm run swap-list` läser registret och genererar `docs/SWAP-LIST.md`, listan över allt som måste bytas ut, uppdelad i *blockerar lansering* och *bör bekräftas*. Listan kan därför aldrig bli inaktuell: den härleds ur koden, inte ur ett dokument någon glömmer uppdatera. Byt värdet, ta bort `todo()`-wrappern, och posten försvinner av sig själv.

`npm run swap-list:strict` avslutar med exit-kod 1 så länge lanseringsblockerare finns kvar. Kör det som ett obligatoriskt steg i produktionsdeployen, så kan sajten inte gå live med påhittade stugpriser.

**Fyra konfidensnivåer** märker varifrån ett värde kommer: `webbplats` (från storasundbygoif.com, behandlas som sant), `härlett` (uträknat ur en uppgift på webbplatsen, bör bekräftas), `extern` (annan källa, bekräftas före publicering), `placeholder` (påhittat, måste bytas).

Skelettet finns redan i repot. Utgå från det och utöka det — skriv inte om kontraktet.

---

## 5. Modul 1 – Fundament, design och innehåll

### Designriktning

Nordiskt återhållsam, varm och funktionell. Föreningen är hundra år gammal och ligger på landet, och det får synas. Undvik generisk startup-estetik: inga lila gradienter, ingen glasmorfism, inga svävande kort med kraftiga skuggor.

Konkret:
- Utgå från föreningens verkliga färger. **[VERIFIERA]** dessa från klubbdräkt, logotyp och webbshopens sortiment innan du väljer palett.
- Typografi med tydlig hierarki. En brödtextfont med bra svenska diakriter (å, ä, ö) och en rubrikfont med karaktär. Systemfonter eller Google Fonts, inget som kostar.
- Generöst med luft. Fotografier från anläggningen är viktigare än illustrationer.
- Mobil först. Merparten av besökarna är föräldrar som kollar träningstider i telefonen.
- Mörkt läge om det kan göras utan att kompromissa med det ljusa.

### Att bygga

Layout och navigation, designsystem med tokens, alla innehållssidor, nyhets- och evenemangssystem, sök, filtrerbart träningsschema, sektionssidor, dokumentarkiv, sponsorsektion, kontaktformulär med spamskydd.

Ta med från nuvarande sajt: länkarna till Facebook och Instagram (med rättad stavning), Playtomic-länken för padel, och en tydlig ingång till webbshoppen.

### 5.3 Träningstider — den del som ändras oftast

Träningstiderna byts flera gånger per säsong, ibland med en dags varsel när en hall blir upptagen. Idag ligger de som löptext på startsidan, vilket betyder att en ändring kräver att någon redigerar sidan i en webbplatsbyggare.

Bygg detta som sajtens enklaste funktion att uppdatera:

- Egen tabell `training_sessions` med sektion, grupp, åldersspann, veckodag, starttid, sluttid, plats, säsong och status
- En redigeringsvy som är en **inline-redigerbar tabell**, inte ett formulär per rad. Klicka på en tid, ändra, spara. Inga modaler, inga sidladdningar.
- Massåtgärder som faktiskt behövs i verkligheten: flytta en hel grupp en timme, pausa en grupp för säsongen, kopiera hela schemat till nästa säsong
- Statusen `uppehåll` som förstaklassbegrepp — webbplatsen använder det redan för Bollek och orientering. Ett pausat pass ska visas som pausat, inte försvinna.
- Full funktion på mobil. Ändringen görs ofta från en telefon i en hall, inte från ett skrivbord.
- Publikt visas schemat som en filtrerbar vy per sektion och åldersgrupp, inte som löptext

Mät målet: en ledare ska kunna flytta ett pass från torsdag 19.00 till torsdag 18.00 på under en minut, från telefonen, utan hjälp.

### Definition of Done

- [ ] Träningstider går att ändra inline på mobil, verifierat i ett E2E-test som kör mot mobil viewport
- [ ] Varje sida har exakt en `<h1>` och en unik, beskrivande `<title>` och `meta description`
- [ ] Samtliga bilder har meningsfull alt-text
- [ ] JSON-LD för `SportsClub`, `Event`, `Place` och `BreadcrumbList` validerar mot Schema.org
- [ ] `sitemap.xml` och `robots.txt` genereras automatiskt
- [ ] Lighthouse ≥ 95 på alla fyra kategorier, mobilt, på minst fem sidor
- [ ] axe-core: noll allvarliga fel
- [ ] Fullständig tangentbordsnavigering med synlig fokusmarkering
- [ ] 301-redirects från samtliga tolv gamla URL:er, inklusive de med å och ä (`/läger`, `/om-föreningen`)
- [ ] Alla externa länkar över HTTPS, alla `tel:`-länkar validerade mot svenskt format

---

## 6. Modul 2 – Webbshop

### Utgångsläget

Föreningens webbshop ligger på `tifosi.se/storasundbygoif`. Verifierat 2026-08-23: Tifosi driver en **egenbyggd Next.js-plattform** bakom Cloudflare, med bilder på egen S3 och imgproxy, och kortbetalningar via Stripe. Klubbshopparna ligger som `tifosi.se/<klubb>` med varukorg på `/<klubb>/shopping-cart`.

Tifosi beskriver själva tjänsten som byggd från grunden utifrån hur svenska idrottsföreningar fungerar, och har en egen teknikavdelning. Det är alltså ingen standardplattform med publik dokumentation, utan ett internt system.

Föreningen äger inte shoppen. Det avgör vad som är möjligt.

### Målbilden

Tifosi ska fortsätta driva och sköta hela e-handeln. Föreningen tar inte över lager, betalningar, frakt eller returer, och ska inte bygga någon egen kassa. Det enda målet är att **besökaren får en bättre och mer sammanhållen upplevelse**, och att den upplevelsen ligger på föreningens egen domän så långt det går.

Att det sista steget, själva köpet, sker hos Tifosi är helt i sin ordning.

Det gör uppgiften betydligt enklare än en full e-handelsintegration. Du ska äga **upptäckten**: hur sortimentet presenteras, hur det ser ut, hur man hittar rätt. Inte transaktionen.

### Vad testerna visade

Iframe-inbäddning testades skarpt 2026-08-23 mot `tifosi.se/storasundbygoif` i Chromium, med en lokal sida på annan origin.

**Det som fungerar:** Tifosi sätter varken `X-Frame-Options` eller `frame-ancestors`, och har inget frame-busting-skript. Sidan renderas i en cross-origin iframe, navigering inuti ramen fungerar (`/storasundbygoif` → `/storasundbygoif/products`), och ramen bryter sig inte ut till toppfönstret. En iframe är alltså tekniskt möjlig.

**Det som ändå gör den till fel verktyg för just det här målet:**

Sidan är 9 269 pixlar hög. I en iframe med fast höjd ger det nästlad scroll, alltså en scrollbar inuti en scrollbar. Att låta ramen växa med innehållet kräver att Tifosi skickar sin höjd via `postMessage`, vilket cross-origin inte går att lösa från vår sida ensam.

Adressfältet ändras aldrig. Ingen kan länka till, dela eller bokmärka en produkt. Bakåtknappen gör fel sak. Sökmotorer indexerar aldrig sortimentet under föreningens domän, så den SEO-vinst man hoppades på uteblir helt.

Och innehållet i ramen är fortfarande Tifosis gränssnitt. En iframe flyttar deras UI in i en låda på vår sida. Den förbättrar inte upplevelsen, vilket var hela poängen.

På mobil blir allt detta värre, och det är där de flesta besökarna finns.

Slutsatsen: iframe löser "stanna på domänen" men inte "bättre UI/UX". Bygg katalogen själv istället, och skicka besökaren till Tifosi först i köpögonblicket. Då får man båda.

### Trappan

Börja på steg A. Fall tillbaka bara om steget visar sig omöjligt.

**Steg A – produktdata från Tifosi, egen katalog.** Det här är målet.

Be Tifosi om en produktfeed i valfritt format: CSV, XML, JSON eller en Google Shopping-feed. Det är läsåtkomst till produktdata, inget mer, och något de kan ge utan risk. Verifierat: deras sidor bär redan strukturerad produktdata i sin RSC-payload, med namn, priser, slugs och storlekar, så datan finns färdig hos dem.

Med feeden bygger du `/webbshop` på egen domän i sajtens design: kategorisidor, produktsidor med bilder och storlekar, sökning och filtrering, kopplingar till rätt sektion. Vid "Köp" går besökaren till Tifosis produktsida eller varukorg med produkt och variant förvald. Produkt-URL:er ser djuplänkbara ut (`/storasundbygoif/products/<slug>` svarar 200), men bekräfta mönstret med Tifosi innan du bygger på det.

Detta ger äkta bättre UX, riktig SEO, delbara länkar och full designkontroll, och Tifosi behöver inte göra något mer än att publicera en feed.

**Steg B – kurerad katalog.** Får du ingen feed: samma katalogupplevelse, men produkterna läggs in manuellt i admin med bild, namn, pris, storlekar och länk. Klubbsortimentet är litet och byts sällan, så underhållet är hanterbart. Varna i admin när ett pris är äldre än trettio dagar.

Skrapa inte Tifosis sajt för att fylla katalogen. Deras data ligger i en intern RSC-struktur som kan ändras när som helst, Cloudflare blockerar dessutom automatiserade webbläsare, och att ta datan utan att fråga är fel sätt att behandla en leverantör föreningen samarbetar med. Fråga först.

**Steg C – iframe med Tifosis medverkan.** Om Tifosi hellre vill bädda in än att dela data: be dem lägga in ett `postMessage`-anrop som rapporterar dokumenthöjden, så att ramen kan växa och den nästlade scrollen försvinner. Kombinera med `shop.storasundbygoif.com` som CNAME. Ger noll underhåll men Tifosis gränssnitt och ingen SEO. Näst sista utvägen.

**Steg D – välgjord landningssida.** Går inget av ovanstående: en sida som förklarar sortimentet, visar exempelplagg och länkar ut med tydlig märkning. Ärligt slår trasigt.

Oavsett steg: när besökaren lämnar till Tifosi ska det vara tydligt att köpet sker hos dem, eftersom det är Tifosi som är säljare och avtalspart och som hanterar leverans, retur och reklamation.

### Uppgift

Skriv ett kort mejl till Tifosi som styrelsen kan skicka. Det ska vara vänligt och konkret: föreningen vill visa sortimentet i sin egen design på sin egen sajt, köpet sker fortfarande hos Tifosi, och det enda som behövs är en produktfeed. Nämn `postMessage`-alternativet som andrahandsval om de hellre vill bädda in. Lägg mejlet i `docs/TILL-KLUBBEN.md`.

### Definition of Done

- [ ] Vilket steg som valdes är dokumenterat med motivering i `BESLUTSLOGG.md`
- [ ] Katalogen renderas serverside, har egna produkt-URL:er och är indexerbar
- [ ] Produktsidor har JSON-LD av typen `Product` med pris och tillgänglighet
- [ ] Vid feed: schemalagd synk med felhantering, loggning och notis till admin vid fel
- [ ] Djuplänken till Tifosi öppnar rätt produkt med rätt variant, verifierat manuellt
- [ ] Det framgår tydligt att köpet genomförs hos Tifosi
- [ ] Fungerar med tom katalog utan att krascha
- [ ] Ingen produktdata är skrapad utan tillstånd

---

## 7. Modul 3 – Stuguthyrning och bokning

### Utgångsläget

Idag: en textsida som säger "För bokning, kontakta kansliet via Facebook eller info@storasundbygoif.com". Ingen kalender, inga priser, inget formulär, ingen översikt över vad som är ledigt.

Detta är den funktion som ger föreningen mest tillbaka. Uthyrning och läger är en verklig intäktskälla, och idag finns ingen struktur alls.

### Vad som ska byggas

**Objekt.** Stugorna (**[VERIFIERA]** sannolikt sex stycken à åtta bäddar, en hundvänlig) plus möjligheten att boka hela anläggningen för läger. Varje objekt har namn, antal bäddar, utrustning, bilder, hundtillåtet ja/nej och beskrivning.

**Tillgänglighetskalender.** Publik månadsvy som visar ledigt, bokat och spärrat. Ingen ska behöva mejla för att få veta om en helg är ledig.

**Förfrågan, inte direktbokning.** Kansliet är volontärer. Bokningen ska gå: förfrågan → kansliet bekräftar → betalning → genomförd. Direktbokning utan mänsklig kontroll passar inte verksamheten. Bygg statusflödet så att direktbokning kan slås på senare utan omskrivning.

**Formuläret** ska fråga: objekt eller hela anläggningen, datum från och till, antal personer, hund ja/nej, kontaktuppgifter, ändamål (fest, läger, övernattning, annat) och fritext. Visa uppskattat pris innan avsändning.

**Dubbelbokningsskydd i databasen, inte i applikationen.** Använd Postgres exclusion constraint:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings ADD CONSTRAINT no_overlap
  EXCLUDE USING gist (
    cabin_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status IN ('bekraftad', 'betald'));
```

Två samtidiga förfrågningar om samma helg ska resultera i att en avvisas av databasen. Detta ska bevisas med ett test som kör parallella transaktioner.

`btree_gist` krävs för `cabin_id WITH =`, inte för intervallet. Och notera fällan: constrainten hoppas över tyst om `starts_at` eller `ends_at` är NULL, eftersom intervallet då blir NULL. Lägg därför alltid till:

```sql
ALTER TABLE bookings
  ALTER COLUMN starts_at SET NOT NULL,
  ALTER COLUMN ends_at   SET NOT NULL,
  ADD CONSTRAINT valid_period CHECK (ends_at > starts_at);
```

Utan `CHECK` kastar `tstzrange` dessutom fel om slutdatum ligger före startdatum.

**Priser.** Administrerbara per objekt, med möjlighet till säsongs- och helgpris samt medlemsrabatt. **[VERIFIERA]**. Inga priser finns publicerade idag, kansliet har dem.

**Kansliets vy.** Lista över förfrågningar, ett klick för att bekräfta eller avböja, kalenderöversikt, möjlighet att spärra datum, och en iCal-feed som kan prenumereras på i valfri kalender.

**E-post.** Kvittens till den som bokar, notis till kansliet, bekräftelse vid godkännande, påminnelse före ankomst. Alla mejl i föreningens röst.

### Definition of Done

- [ ] Exclusion constraint är på plats och bevisad med parallellt transaktionstest
- [ ] Sommartidsskiftet testat: en bokning över natten mellan 29 och 30 mars beräknas rätt
- [ ] Kalendern är tillgänglig med tangentbord och läsbar med skärmläsare
- [ ] iCal-feeden validerar och importeras korrekt i Google Calendar och Apple Kalender
- [ ] Alla fyra mejltyper skickas och renderar i Gmail, Outlook och Apple Mail
- [ ] E2E-test: förfrågan → bekräftelse → betalningsmarkering → avslut
- [ ] Bokning bakåt i tiden och slutdatum före startdatum avvisas med begripligt felmeddelande

---

## 8. Modul 4 – Medlemsportal och betalning

### Utgångsläget

Idag: "Medlemsavgiften betalas in på bg 342-8232. I betalningen ska personnummer på samtliga medlemmar anges."

Två problem. Dels finns ingen automatik. Någon måste manuellt läsa bankutdrag och föra register. Dels är instruktionen att skriva personnummer i ett fritextfält i en banköverföring olämplig hantering av personuppgifter. Det ska bort.

### Betalningsläget – läs noga

Detta avsnitt ersätter en vanlig missuppfattning. **Omedelbar aktivering av medlemskap går utmärkt med Swish.** Det som inte går är att göra det med *Swish Företag*, som är den produkt föreningen har idag.

Swish säljs i flera produkter, och skillnaden mellan dem är hela frågan:

| Produkt | API | Callback vid betalning | Konsekvens för oss |
|---|---|---|---|
| **Swish Företag** | Nej (bara publik QR-generering) | **Nej** | Sajten kan visa en QR, men får aldrig veta att någon betalat. Avstämning blir manuell. |
| **Swish Handel** | Ja, Swish Commerce API över mTLS | **Ja** | Medlemskapet aktiveras automatiskt på sekunder. Detta är vad beställaren vill ha. |
| **Swish Återkommande betalningar** | Ja, separat API | Ja, på både medgivande och betalning | Årsavgiften kan förnyas automatiskt efter ett BankID-medgivande. |

**Så ja: med Swish Handels API fungerar omedelbar aktivering precis som önskat.** Flödet är:

1. `PUT /swish-cpcapi/api/v2/paymentrequests/{uuid}` med klientcertifikat. Du skickar belopp, meddelande, din `payeePaymentReference` och en `callbackUrl`.
2. Utelämnar du `payerAlias` får du tillbaka ett `paymentrequesttoken`. På mobil öppnar du Swish-appen med `swish://paymentrequest?token=…&callbackurl=…`, på desktop visar du samma token som QR.
3. Medlemmen signerar med BankID. Swish gör en HTTPS POST till din `callbackUrl` med `status: PAID`, och försöker upp till tio gånger tills du svarar 200.
4. Du aktiverar medlemskapet och skickar välkomstmejlet. Hela förloppet tar sekunder.

Två fällor att bygga runt. Returen till webbläsaren är **inte** bevis på betalning — den kan landa i en annan flik eller till och med en annan webbläsare, så returadressen måste bära tillräckligt med state för att hitta tillbaka till rätt order. Callbacken är sanningen. Och v1 av skapa-endpointen togs ur drift 1 januari 2026; använd v2 för `PUT`.

**Om återkommande betalningar.** Detta korrigerar ett tidigare påstående: Swish har sedan hösten 2024 en riktig mandatprodukt, *Swish Återkommande betalningar*, som marknadsförs uttryckligen för medlemskap och träning. Medlemmen signerar ett medgivande en gång med BankID, och föreningen kan sedan dra årsavgiften. Den kräver ett eget bankavtal utöver Swish Handel, alla betalares banker stödjer den ännu inte, och Swish gör **inga automatiska omförsök** vid nekad betalning — den logiken måste ligga hos oss.

### Vad detta kostar och vad klubben behöver göra

Swish Handel kostar ungefär 60–85 kr per månad plus omkring 2 kr per transaktion hos de billigaste bankerna, utan startavgift. Swedbank ligger klart högst med startavgift per Swish-nummer. Föreningen behöver organisationsnummer från Skatteverket, ett föreningskonto, stadgar och årsmötesprotokoll, samt ett formellt beslut om vem som företräder föreningen. Räkna med veckor, inte dagar.

Certifikathanteringen går att slippa. Genom **teknisk leverantör** tecknar föreningen fortfarande avtalet med sin bank och får sitt eget 123-nummer, men en partner sköter certifikaten. Föreningen anger då partnern som teknisk leverantör i bankansökan.

En sak att flagga för styrelsen: många föreningar kör idag på kassörens privata Swish. Det är ett villkorsbrott, inte en gråzon — Swish Privat får uttryckligen inte användas i föreningsverksamhet.

### Arkitektur: ett adapterlager med tre implementationer

Bygg ett gemensamt gränssnitt så att bytet mellan produkterna blir en konfigurationsändring i `config/club.ts`, inte en omskrivning.

```typescript
interface PaymentProvider {
  createPayment(input: PaymentRequest): Promise<PaymentSession>
  getStatus(paymentId: string): Promise<PaymentStatus>
  refund(paymentId: string, amount?: number): Promise<RefundResult>
  handleCallback?(req: Request): Promise<CallbackResult>
}
```

**`SwishManualProvider` — fungerar med det klubben har idag. Byggs först.**

Medlemmen registrerar sig. Systemet räknar ut avgiften från födelseår och hushållssammansättning, skapar en unik betalreferens (`SSG-2026-0431`) och visar en Swish-QR med förvalt belopp och referens i meddelandefältet. QR:en genereras mot Swish publika endpoint `https://mpc.getswish.net/qrg-swish/api/v1/prefilled`, som fungerar utan certifikat och utan Swish Handel-avtal. Hitta inte på en egen `swish://`-sträng.

Medlemmen får status `väntar_på_betalning`. Kassören stämmer av genom att antingen ladda upp en export från banken, som automatmatchar på referens, eller bocka av manuellt i en lista. Vid match aktiveras medlemskapet och välkomstmejlet går ut.

**`SwishHandelProvider` — uppfyller kravet. Byggs klar bakom funktionsflagga.**

Full Commerce API-integration enligt flödet ovan, med e-commerce-läge på desktop och m-commerce med app-växling på mobil. Verifiera `callbackIdentifier` på inkommande callbacks, gör hanteringen idempotent, och bygg en pollande fallback mot `GET /paymentrequests/{id}` för det fall callbacken aldrig kommer.

**`StripeProvider` — alternativ utan bankavtal.**

Stripe ger Swish och kort utan bankavtal och utan certifikat, men Stripe är merchant of record: medlemmen ser Stripes namn i Swish-appen, inte föreningens. Stripe-Swish saknar dessutom återkommande betalningar och tvistehantering. Bygg adaptern, men rekommendera Swish Handel om styrelsen orkar med bankpappersarbetet, eftersom det ger både föreningens eget namn i appen och möjlighet till automatisk förnyelse.

**Bankgiro** behålls som betalningsalternativ för den som vill, med samma referenssystem.

Sätt `club.payment.provider` till `"swish-manual"` från start. Dagen bankavtalet är klart byter någon det värdet till `"swish-handel"` och inget annat i koden behöver ändras.

### Personuppgifter – hantera rätt

Personnummer behövs sannolikt för LOK-stöd och RF:s system. **[VERIFIERA]** exakt vad föreningen behöver.

Regler:
- Samlas in i portalen över HTTPS, aldrig i ett meddelandefält i en betalning
- Lagras kolumnkrypterat med `pgcrypto`, aldrig i klartext
- Läses bara av admin-roll, aldrig i listvyer, aldrig i loggar, aldrig i mejl
- För avgiftsberäkning används enbart födelseår. Hela personnumret behövs inte för det
- Registerförteckning, laglig grund och gallringsrutin dokumenteras i `GDPR.md`
- Medlemmen kan se, rätta och begära radering av sina uppgifter i portalen

### Vad som ska byggas

**Registrering.** Ett flöde för enskild medlem och ett för familj. Familjeflödet lägger till hushållsmedlemmar med födelseår och väljer automatiskt familjeavgift om det blir billigare, och visar uträkningen så att medlemmen ser att systemet räknat rätt.

**Medlemssida.** Status, giltighetstid, betalningshistorik, digitalt medlemsbevis med QR, egna uppgifter, hushållets medlemmar, anmälan till aktiviteter, samtycken.

**Admin.** Medlemsregister med sök och filter, betalningsöversikt, avstämningsverktyg, export för LOK-stöd och IdrottOnline, påminnelseutskick, statistik per sektion och åldersgrupp.

**Livscykel.** Påminnelse före förfall, notis vid förfall, automatisk statusändring till `inaktiv`, enkel förnyelse med förifyllda uppgifter.

### Definition of Done

- [ ] Avgiftsberäkningen har enhetstester för samtliga fall: junior, senior, familj, medlem som fyller 18 under året, hushåll där familjeavgift blir dyrare än individuella avgifter
- [ ] Swish-QR genererar korrekt betalsträng med belopp och referens, testad i skarp Swish-app
- [ ] Swish Handel testad i testmiljö: callback tas emot, `callbackIdentifier` verifieras, dubbla callbacks är idempotenta
- [ ] Pollande fallback mot `GET /paymentrequests/{id}` aktiveras när callbacken uteblir
- [ ] Returen till webbläsaren behandlas aldrig som betalningsbevis — bevisat med ett test som returnerar utan att callbacken kommit
- [ ] Byte av `club.payment.provider` mellan alla tre adaptrar fungerar utan kodändring
- [ ] Avstämning via filuppladdning matchar korrekt och hanterar dubbletter, felstavade och saknade referenser
- [ ] Stripe testad i testläge med webhook, inklusive signaturverifiering och idempotens vid dubbla webhooks
- [ ] Personnummer är krypterat i vila – bevisa med en `SELECT` som visar chiffertext
- [ ] Ingen personuppgift förekommer i loggar eller felmeddelanden
- [ ] `audit_log` fångar varje admin-ändring av medlems- och betalningsdata
- [ ] E2E: registrering → betalning → aktivering → medlemsbevis, för båda adaptrarna
- [ ] RLS-test: en inloggad medlem kan inte läsa en annan medlems uppgifter

---

## 9. Arbetssätt – hur du arbetar autonomt

### Ordningen

Bygg i denna sekvens. Gå inte vidare förrän föregående modul klarar sin Definition of Done.

1. Fundament: projekt i det befintliga repot, databas, auth, designsystem, deploy till beställarens Vercel Pro-konto
2. Innehåll och sektioner
3. Admin och innehållsredigering
4. Stuguthyrning
5. Medlemsportal med `SwishManualProvider`
6. `SwishHandelProvider` och `StripeProvider` bakom funktionsflagga
7. Webbshop
8. Polish: prestanda, tillgänglighet, SEO, migrering

Uthyrning före medlemsportal, eftersom uthyrning ger intäkter och är enklare att verifiera.

### Verifiering – du godkänner ditt eget arbete

Efter varje modul kör du, utan att bli tillsagd:

```bash
npm run typecheck   # noll fel
npm run lint        # noll fel
npm run test        # enhetstester gröna
npm run test:e2e    # Playwright gröna
npm run build       # bygget går igenom
npm run swap-list   # listan över platshållare uppdateras
npm run lint:hardcoded  # inget klubbfaktum hårdkodat utanför config/
```

Plus per modul: Lighthouse mobilt på berörda sidor, axe-core på berörda sidor, och ett E2E-test som kör igenom det verkliga användarflödet från början till slut.

**Skriv aldrig "klart" om ett test inte körts.** Skriv aldrig ett test som bara kontrollerar att en komponent renderar. Testa flödet: kan någon faktiskt boka en stuga, betala en avgift, bli medlem?

**Verifiera integrationer på riktigt.** Stripe testas i testläge med `stripe listen` och verkliga testkort. Swish-QR:en läses av med en riktig telefon. iCal-feeden importeras skarpt i en kalender. Mejlen skickas och öppnas i verkliga klienter. En integration du bara har läst dokumentationen om är inte verifierad.

### Loggböcker du för löpande

**`BESLUTSLOGG.md`** varje arkitekturbeslut med alternativ, val och motiv. En vaktmästare ska kunna läsa den om två år och förstå varför.

**`TILL_KLUBBEN.md`** allt du behöver svar på från en människa, i klarspråk utan jargong. Sortera efter hur mycket det blockerar. Detta är ditt viktigaste dokument.

**`KALLOR.md`** varje faktapåstående med källa, URL och datum.

**`docs/SWAP-LIST.md`** genereras, skrivs aldrig för hand. Kör `npm run swap-list` efter varje modul så att listan speglar koden.

**`KOSTNADER.md`** verkliga månadskostnader och när uppgradering behövs.

### När du ska stanna och fråga

Fortsätt med rimligt antagande och notera det, om beslutet är reversibelt.

Stanna och fråga, om beslutet innebär:
- Att pengar rör sig, eller att villkor för betalning ändras
- Att personuppgifter behandlas på ett nytt sätt
- Att ett faktapåstående om föreningens historia eller meriter publiceras utan belägg
- Att ett avtal eller villkor hos tredje part riskerar att brytas
- Att gamla URL:er slutar fungera

### Migrering och driftsättning

- Alla tolv befintliga URL:er ska 301-redirecta, inklusive de med å och ä
- Bilder hämtas från nuvarande CDN, optimeras och läggs i Supabase Storage. Behåll originalen.
- Skriv en `DRIFT.md` för en volontär: hur man lägger upp en nyhet, ändrar en träningstid, bekräftar en bokning, stämmer av betalningar, och vem man ringer när något går sönder
- Skriv en `LANSERING.md` med checklista: DNS, SSL, e-postdomän med SPF/DKIM/DMARC, backup, Search Console, 404-övervakning
- Gör den nya sajten tillgänglig på en förhandsvisnings-URL så att styrelsen kan granska innan växling

---

## 10. Sammanfattat uppdrag

Bygg en modern, snabb och tillgänglig plattform för Stora Sundby GOIF på Next.js, Supabase och Vercel.

Ersätt en tunn tolvsidig Hemsida24-sajt med en komplett föreningssajt. Researcha och skriv fram den historia och det innehåll som saknas, utan att uppfinna ett enda faktum. Bevara den varma, ideella och inbjudande rösten som redan finns, och rätta bara det som är inkonsekvent.

Bygg tre funktioner som föreningen saknar helt: en webbshopsupplevelse som håller besökaren kvar på egen domän så långt Tifosi tillåter, ett bokningssystem för stugorna med kalender och förfrågningsflöde, och en medlemsportal där registrering och betalning sker digitalt.

Bygg det som ett skelett med märkta platshållarvärden där riktiga uppgifter saknas, så att arbetet aldrig stannar på en uppgift kansliet inte hunnit svara på. Håll all klubbdata på ett ställe, så att en rättelse slår igenom överallt samtidigt och listan över vad som återstår skriver sig själv.

Arbeta modul för modul. Verifiera själv. Bygg avancerat där det ger ett bättre resultat, och lägg ett begripligt gränssnitt ovanpå. Fråga bara när svaret kräver en människa.

Föreningen fyller 101 år. Bygg något som håller i tio till.
