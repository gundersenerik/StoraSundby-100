# Till klubben

Frågor som bara en människa i föreningen kan svara på.

Sajten byggs vidare även utan svaren — där en uppgift saknas står ett tydligt
märkt platshållarvärde, och `docs/SWAP-LIST.md` håller reda på vartenda ett.
Men platshållarna kan inte följa med i produktion. Åtta av dem stoppar
lanseringen tills någon har svarat.

Svaren behöver inte komma i ordning eller på en gång. Svara på det ni kan,
när ni kan, så byts värdena ut allt eftersom.

**Så här är listan sorterad**

- **A. Blockerar lansering.** Sajten får inte gå live med nuvarande värde.
- **B. Blockerar en modul.** Sajten kan lanseras, men en funktion kan inte byggas klar.
- **C. Bör bekräftas.** Vi har ett rimligt värde, men vill veta att det stämmer.
- **D. Material vi behöver.** Filer och dokument, inte svar på frågor.
- **E. Beslut vi redan tagit.** Till er kännedom — säg till om något blivit fel.

---

## A. Blockerar lansering

### A1. Organisationsnummer — hittat, flyttad till C7

Vi hittade numret själva efter att listan skrevs. Det blockerar därför inte
längre lanseringen, men vi vill fortfarande att ni bekräftar det.

Se **C7** längre ner.

### A2. Föreningens riktiga färger

Vi har lagt in en mörkgrön och en gul som platshållare. De är påhittade.

Vi behöver de färger som faktiskt används — helst från klubbdräkten,
logotypen och sortimentet i webbshoppen. En bild på matchtröjan räcker
långt. Har ni logotypen som vektorfil (`.ai`, `.eps` eller `.svg`) är det
ännu bättre, se D2.

Färgerna bör bytas innan designen låses, annars görs arbetet två gånger.

Berör `club.brand` och `design.color`.

### A3. Klubbens Swish-nummer

Numret som medlemsavgifter betalas till idag. Används för att generera den
QR-kod medlemmen skannar. Ett fel här skickar pengar fel.

Står nu som `123 456 78 90`, alltså ett rent påhitt.

### A4. Priser för stuguthyrningen

Inga priser finns publicerade någonstans, varken på sajten eller hos någon
extern part. Vi har hittat på siffror för att kunna bygga bokningsflödet:
1 200 kr per stuga och natt, 900 kr för medlem, 6 000 kr för hela
anläggningen, 500 kr i städavgift.

Samtliga är påhittade. Bokningsflödet är nu byggt, och tills ni svarat
visar sajten INGA belopp alls — varken på uthyrningssidan, i formuläret
eller i mejlen. Gäster får i stället beskedet att kansliet återkommer med
pris. Den dag ni skickar priserna läggs de in, och prisvisningen slår på
av sig själv överallt samtidigt.

Vi behöver: pris per stuga och natt, eventuellt medlemspris, pris för hela
anläggningen vid läger, städavgift, och om det finns helg- eller
säsongspriser. Tas depositionsavgift ut?

### A5. Styrelsens sammansättning

Webbplatsen säger att styrelsen består av ordförande plus sju ledamöter,
men namnger bara ordföranden, Christoffer Fallqvist. laget.se listar fem
personer, men den sidan har inte uppdaterats sedan 2018 och vi behandlar
den inte som tillförlitlig.

Vi behöver aktuell uppställning med namn och roll. Kontaktuppgifter bara
för de som vill ha dem publika — det är helt i sin ordning att en ledamot
bara står med namn och roll.

Sju platser står nu som "Ledamot 2" till "Ledamot 8".

### A6. Telefonnummer till orienteringen

Länken på nuvarande sajt är `tel:07232912217`. Elva siffror, vilket inte är
ett giltigt svenskt mobilnummer — den går alltså inte att ringa. Antagligen
en felskrivning som stått kvar länge.

Vilket nummer går till Johan Ryding?

### A7. Löper medlemsåret på kalenderår?

Alltså: gäller ett medlemskap 1 januari till 31 december, eller följer det
en säsong?

Svaret styr när påminnelser om förnyelse skickas och när ett medlemskap
räknas som inaktivt. Vi har antagit kalenderår.

### A8. Vad kräver LOK-stödet i personuppgifter?

Nuvarande sajt ber medlemmar skriva personnummer i meddelandefältet på en
banköverföring. Det bör upphöra oavsett hur resten av frågan besvaras —
fritextfältet i en betalning är inte en lämplig plats för personnummer.

Men vi behöver veta vad ni faktiskt måste samla in. Krävs fullständigt
personnummer för LOK-stöd och IdrottOnline, eller räcker födelsedatum?
Kassören eller den som gör LOK-ansökan vet.

Frågan avgör vad vi bygger. Behövs bara födelseår klarar vi
avgiftsberäkningen med det, och då behöver personnummer aldrig lagras.
Krävs hela numret lagras det krypterat och läses bara av administratör.

---

## B. Blockerar en modul

### B1. Produktfeed från Tifosi

Vi vill visa sortimentet på föreningens egen sajt i föreningens egen design,
och skicka besökaren till Tifosi först i köpögonblicket. För det behövs en
produktfeed från Tifosi. Utan den bygger vi katalogen manuellt istället,
vilket blir mer underhåll för er.

Färdigt mejl att skicka finns i bilaga 1.

### B2. Vill styrelsen teckna Swish Handel?

Det här är ett beslut, inte en uppgift.

Med Swish Företag, som föreningen har idag, kan sajten visa en QR-kod men
aldrig få veta att någon betalat. Kassören måste stämma av manuellt mot
bankutdrag. Det fungerar, och vi bygger det först.

Med Swish Handel aktiveras medlemskapet automatiskt inom sekunder efter
betalning. Det kostar ungefär 60–85 kr per månad plus omkring 2 kr per
transaktion, och kräver ett bankavtal som tar veckor att få på plats.

Vi bygger så att bytet mellan dem är en enda rad i konfigurationen. Ni kan
alltså börja manuellt och byta senare utan att något behöver skrivas om.
Men om ni vill ha det till lansering bör ansökan påbörjas nu.

En sak att flagga för styrelsen: om någon i föreningen tar emot avgifter på
sin privata Swish är det ett villkorsbrott mot Swish användarvillkor, inte
en gråzon. Swish Privat får inte användas i föreningsverksamhet.

### B3. Hur många stugor finns det?

Sajten anger 8 bäddar per stuga och plats för totalt 48 personer, vilket
ger sex stugor. Men antalet står aldrig utskrivet, så vi har räknat ut det.

Vi behöver också veta vilken stuga som tillåter hund, och gärna vad varje
stuga heter eller numreras som, eftersom varje stuga blir ett bokningsbart
objekt med egen kalender.

Bokningen är nu byggd med sex stugor som heter Stuga 1 till Stuga 6 tills
ni sagt annat. Ingen av dem är märkt som hundvänlig än — vi vet att en av
dem är det, men inte vilken, så gäster med hund ombeds skriva det i
förfrågan så placerar ni dem rätt. Vi antog också incheckning 15.00 och
utcheckning 11.00 — säg till om andra tider gäller.

### B4. Finns det ett telefonnummer till kansliet?

laget.se anger 016-621 37, men numret finns inte på föreningens egen
webbplats. Är det i bruk, och vill ni ha det publikt?

Ett publikt nummer är särskilt värdefullt för uthyrningen, där folk vill
kunna ringa och fråga.

---

## C. Bör bekräftas

### C1. Stämmer träningstiderna?

Tiderna på startsidan anger ingen säsong. Vi vet därför inte om de gäller
nu, eller om de är kvar sedan i våras.

Skicka gärna aktuellt schema per grupp, så lägger vi in det. Framöver ska
ni kunna ändra tiderna själva direkt på sajten, från telefonen, på under en
minut — det är den funktion som ändras oftast och byggs därefter.

### C2. Åldersgrupperna i gymnastiken

Här motsäger nuvarande sajt sig själv. Startsidan anger 2–4 år och 5–8 år,
gymnastiksidan anger 3–5 år och 6–8 år.

Vi har utgått från sektionssidan, eftersom den är mer specifik. Vilket är
rätt?

### C3. Finns OCR som sektion?

Instagram-kontot @storasundbygoifocr finns, men OCR nämns inte någonstans
på webbplatsen. Är det en aktiv sektion som saknas på sajten, eller något
som lagts ner?

Är den aktiv får den en egen sektionssida som alla andra, och vi behöver en
kontaktperson.

### C4. Exakt position för anläggningen

Vi har en ungefärlig koordinat för Stora Sundby. För kartan och för
sökmotorernas strukturerade data vill vi ha rätt punkt för
Hammargårdsvägen 1 — helst där man faktiskt ska parkera.

Enklast: öppna Google Maps, långtryck på rätt punkt, kopiera koordinaterna.

### C5. Minsta antal nätter vid uthyrning?

Går det att hyra en enstaka natt, eller finns minimikrav över helger och
vid läger? Vi har antagit att en natt går bra.

### C6. Har ni tillgång till IdrottOnline?

Vi kunde inte läsa föreningens sida på idrottonline.se. Vet ni om den
används aktivt, och vem som har inloggningen? Systemet kan behöva ta emot
medlemsdata från den nya sajten.

### C7. Stämmer organisationsnumret?

Vi har hittat **818000-3694** och lagt in det. Det stod tidigare som en
lanseringsblockerare, eftersom numret inte finns någonstans på er egen
webbplats.

Vi hittade det i två oberoende källor. allabolag.se har föreningen med
fullständigt namn, formen ideell förening och exakt den adress och det
postnummer som står på er webbplats. laget.se anger samma nummer. Numrets
inbyggda kontrollsiffra stämmer också, vilket utesluter en felskrivning.

Det räcker för att vi ska våga använda det på sajten. Men numret ska
så småningom in i en bankansökan för Swish och i integritetspolicyn, och
där vill vi inte gissa. Har kassören ett registerutdrag från Skatteverket
räcker det att jämföra siffrorna en gång.

---

## D. Material vi behöver

### D1. Dokument att publicera

Stadgar, senaste årsmötesprotokoll, verksamhetsberättelser och
årsredovisningar. De läggs i ett dokumentarkiv på sajten.

Har ni policyer — barn- och ungdomspolicy, trygghetspolicy, drogpolicy,
jämställdhetsplan, uppförandekod — vill vi ha dem också. Saknas de säger ni
bara det; Riksidrottsförbundet ställer krav på flera av dem för bidrag, så
det är i så fall värt att veta.

### D2. Logotyp och bilder

Logotypen som vektorfil om den finns, annars högsta upplösning ni har.

Foton från anläggningen: gräsplanerna, stugorna inifrån och utifrån,
elljusspåret, padelbanan, gärna från verksamheten. Bilder från
anläggningen är viktigare för sajten än illustrationer, och stugbilder är
direkt avgörande för att någon ska vilja boka.

Vi hämtar de 39 bilderna från nuvarande sajt, men de är av blandad
kvalitet och flera är för små.

### D3. Material om föreningens historia

Föreningen fyller 101 år. Vi kommer söka i kommunarkiv, tidningsarkiv och
idrottshistoriska källor, men det ni själva har väger tyngst: jubileumsskrifter,
gamla protokoll, fotografier, tidningsurklipp, eller helt enkelt någon
äldre medlem som minns.

Ingenting om föreningens historia publiceras utan källa. Hellre en kort och
sann historik än en lång och påhittad.

### D4. Firmatecknare

Vem företräder föreningen formellt? Behövs för bankärenden om Swish Handel
blir aktuellt, och bör framgå av ett årsmötes- eller styrelseprotokoll.

---

## E. Beslut vi redan tagit

Där webbplatsen och en extern plattform säger olika saker gäller
webbplatsen. Det är principen vi arbetar efter. Fyra fall där den fått
avgöra:

**Postnummer.** Webbplatsen anger 635 34, laget.se anger 640 40. Vi
använder 635 34. Säg till om det är fel.

**Kontaktperson för orienteringen.** Webbplatsen anger Johan Ryding och
Emelie Gustafsson. laget.se anger Louise Gyldenlöve. Vi följer webbplatsen.

**Styrelsens storlek.** Åtta platser enligt webbplatsen, inte fem enligt
laget.se. Se A5.

**Stavning av Instagram-länken.** Sidfoten på nuvarande sajt länkar till
`instagram.com/storasunbygoif` utan d. Länken går till fel konto. Rättat.

---

## Bilaga 1 — Mejl till Tifosi

Skicka som det är, eller ändra fritt.

> **Ämne:** Produktfeed för Stora Sundby GOIF:s klubbshop
>
> Hej,
>
> Vi håller på att bygga en ny webbplats för Stora Sundby GOIF och vill
> gärna visa vårt klubbsortiment direkt på föreningens egen sajt, i sajtens
> design.
>
> Vi vill vara tydliga med att vi inte vill ta över någon del av
> försäljningen. Köpet ska fortsatt ske hos er — vi länkar till er
> produktsida när besökaren klickar på köp, och ni är precis som idag
> säljare och avtalspart med ansvar för leverans, retur och reklamation.
> Det vi vill åt är bara upptäckten: att någon som kommer till vår sajt ser
> vad som finns utan att först behöva klicka sig vidare.
>
> Konkret behöver vi en produktfeed med namn, pris, bild, storlekar och
> länk till produktsidan. Format spelar ingen roll — CSV, XML, JSON eller
> en Google Shopping-feed fungerar alla lika bra. Det är ren läsåtkomst
> till produktdata.
>
> Om ni hellre vill att vi bäddar in er sida istället har vi ett
> andrahandsalternativ: om er sida skickar sin höjd via `postMessage` kan
> vi låta ramen växa med innehållet, så slipper besökaren scrolla i två
> lager. Det kräver en liten ändring hos er, men vi tar gärna det samtalet.
>
> Hör gärna av er om något är oklart.
>
> Vänliga hälsningar,
> Stora Sundby GOIF

## Bilaga 2 — Frågor till kansliet

De uppgifter vi behöver som antagligen bara finns i kansliets huvud eller
pärmar. Motsvarar A3, A4, A7, B3 och C5 ovan.

> Hej,
>
> Inför den nya webbplatsen behöver vi några uppgifter som inte finns
> publicerade någonstans. Ta det i den takt ni hinner.
>
> **Stugorna.** Hur många är de, vad heter eller numreras de, och vilken är
> det som tillåter hund? Vad kostar de per natt — finns medlemspris,
> helgpris eller säsongspris? Vad kostar hela anläggningen vid läger?
> Tillkommer städavgift eller deposition? Går det att hyra en enstaka natt?
>
> **Medlemsavgifterna.** Vilket Swish-nummer betalas de till idag? Och
> löper medlemsåret på kalenderår, eller följer det en säsong?
>
> Priserna är det mest brådskande. Vi har lagt in påhittade siffror för att
> kunna bygga bokningsfunktionen, och de måste bytas innan sajten går live
> — annars får folk fel pris.
>
> Tack!
