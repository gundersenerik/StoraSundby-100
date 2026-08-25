# Nulägesaudit – storasundbygoif.com

Datum: 24 augusti 2026  
Granskade sidor: startsidan, `/fotboll`, `/kontakta-oss`, `/bli-medlem`, `/webbshop`  
Vyportar: 1440 px desktop och 390 px mobil  
Metod: computed styles och renderade mått i den godkända webbläsarsessionen.

Förkortningar: **OS** = `"Open Sans", sans-serif`; **OSC** = `"Open Sans Condensed", sans-serif`.

## Faktiskt renderade textroller

| Roll | Familj | Desktop 1440 px | Mobil 390 px | Text-/containerbredd |
|---|---|---|---|---|
| Sajttitel/logotyp | – | Bild, ingen renderad text | Bild, ingen renderad text | Alt-text: “Stora Sundby GOIF” |
| Hero/slideshow | – | Ingen text | Ingen text | Endast bild |
| H1 | OSC i CSS | Saknas i DOM; token 59,408/65,349 px, 700, uppercase | Saknas; token cirka 34,130/37,543 px | `max-width:none`; inget faktiskt element |
| H2 sidtitel/“Aktivitet” | OSC | 45,696/54,835 px, 700, uppercase | 29,2592/35,111 px, 700, uppercase | Start 1282,5/176,73 px; mobil 327,95/113,16 px |
| H2 footer | OSC | 35,152/38,667 px, 700, uppercase | 25,1056/27,616 px, 700, uppercase | Desktop 395,45/279,02 px; mobil 327,95/199,29 px |
| H3 slogan | OSC | 35,152/42,182 px, 700, uppercase | 25,1056/30,127 px, 700, uppercase | Desktop cirka 872,7 px text; mobil 315,45 px och tre rader |
| H4 | OSC i CSS | Saknas; token 27,04/35,152 px, 700, uppercase | Saknas; token cirka 21,572/28,044 px | `max-width:none` |
| H5 aktivitetsrubrik | OSC | 18,9091/26,473 px, 700, uppercase | 16,8832/23,637 px, 700, uppercase | Mobil text upp till 198,20 px |
| H6 kontaktetikett | OSC | 17,6/26,4 px, 700, uppercase | 17,6/26,4 px, 700, uppercase | Mobil container 342,95 px |
| Navigation | OS | 14/14 px, 600, 1 px, uppercase | Samma | Längsta mobiltext 217,08 px i 249,08 px box |
| Body/artikel | OS | 17/31,45 px, 400 | Vanligen 15,4545/28,5909 px; root-body fortsatt 17/31,45 | Fotboll desktop 960/957,53 px; mobil 327,95/322,38 px |
| Aktivitetskort body | OS | 16,5854/29,935 px, 400 | Samma | Mobil 327,95/292,20 px |
| Inline-länk | OS | Ärver 17/31,45 px, 400; normalt understruken | Ärver 15,4545/28,5909 px | Kontaktens mejllänk saknar understrykning |
| CTA “WEBBSHOP” | OS | 15/15 px, 600, 1 px, uppercase | 13,6364/13,6364 px, 600, 1 px, uppercase | 18×24 px padding |
| Mobil menyknapp | Arial/default | – | Knappen 13,333 px; textspannet “Meny” är satt till 0/0 px och bara CSS-ikon syns | 25×22 px |
| Footer metadata | OS | 17/31,45 px, 400 | 15,4545/28,5909 px | Kolumn desktop 395,45 px; mobil 327,95 px |

Värden skrivs som `font-size/line-height`. Alla observerade roller hade computed `max-width:none`; innehållsbredden styrdes av sidbyggarens rader och kolumner.

## Fontladdning och evidens

- Huvud-CSS importerar Google Fonts: Open Sans Condensed 300/700 och Open Sans 400/500/600/700.
- Synlig granskad DOM använder computed OS och OSC. `document.fonts.status` var `loaded`.
- Fallback är endast generisk `sans-serif`.
- FontAwesome WOFF2 observerades direkt och används för socialikon. Dess `@font-face` har `font-display:block`.
- Inline base64-definitioner finns även för Playfair Display och Rubik, men ingen granskad synlig text använde dem.
- Google-importens URL saknar `display=swap`. Exakt Google WOFF2 syntes inte separat i asset-inventeringen, sannolikt på grund av import/cache.

## Problem och risker

### Hierarki

- Ingen H1 fanns på någon av de fem granskade sidtyperna.
- Sidtitlarna är H2.
- Startsidan går H2 → H5 → H3 → footer-H2.
- Kontakta oss går H2 → H6.
- Visuell typstorlek och dokumentstruktur är därmed sammanblandade.

### Läsbarhet

- Fotbollssidans paragraf använder nästan hela en 960 px bred rad utan läsbreddsgräns.
- Mobil H5 är bara cirka 0,3 px större än aktivitetskortens brödtext.
- H6 ligger också mycket nära brödtextstorleken.
- Mobil CTA är 13,636 px trots att själva träffytan är generös.
- Samtliga rubriknivåer är uppercase, även när innehållet är längre.
- Brödtextens radavstånd 1,85 är ovanligt luftigt samtidigt som en del mobiltext krymper till 15,45 px.

### Länkar och kontroller

- De flesta löptextlänkar är understrukna, men kontaktens mejllänk är ett observerat undantag.
- Mobil menyknapps text är visuellt nollställd; åtkomligt namn måste kontrolleras separat i implementationen.
- Navigationen är 14 px, uppercase och har 1 px tracking i både desktop och mobil.

### Prestanda och layoutskifte

- Google-importen saknar explicit `font-display`, vilket kan ge fallback eller osynlig text vid kallstart.
- Ingen aktiv förskjutning observerades efter laddning: H2, H3, H5, body och footer hade identiska rektanglar över en sekund och scrollhöjden var oförändrad.
- Kall-cache-CLS kunde inte mätas direkt i den isolerade sidmiljön. Risken är därför inte bekräftad som ett faktiskt fel, men laddningsstrategin är svagt definierad.
- FontAwesomes `font-display:block` kan göra ikonen tillfälligt osynlig.

## Positivt att bevara

- Inget horisontellt overflow observerades vid 1440 eller 390 px.
- Den längsta mobilnavlänken fick plats.
- Slogans tre rader höll sig inom mobilcontainern.
- Kontrasten mellan kondenserade rubriker och normalbred text ger en användbar idrottslig grundidé.
- Understrukna länkar är redan norm på större delen av webbplatsen.

## Direkt mappning till den nya profilen

| Nuvarande | Ny roll |
|---|---|
| Open Sans body | Archivo 400, 100 % bredd, 16 px UI eller 17–18 px redaktionell |
| Open Sans Condensed H1 | Archivo 800, 80 % bredd, riktig H1 |
| Open Sans Condensed H2 | Archivo 750, 86 % bredd |
| Open Sans Condensed H3 | Archivo 700, 92 % bredd |
| Open Sans Condensed H4–H6 | Archivo 700, 100 % bredd |
| 14 px uppercase nav | Archivo 600, 15–16 px, sentence case |
| 13,636 px mobil CTA | Archivo 700, 16 px; total touchyta minst 44 px rekommenderad |
| Obegränsad artikelrad | `max-inline-size:66ch` |
| Generell uppercase | Uppercase bara för kort eyebrow/matchetikett |
| Blandad fontladdning | En versionslåst Archivo upright + behovsstyrd italic |

## Avgränsning

Auditen täcker fem representativa sidtyper och de komponenter som syns där. Den är inte en crawl av varje sida eller varje redigerarläge. CSS-token för H1/H4 redovisas eftersom elementen saknades i den granskade DOM:en; dessa är deklarerade värden, inte observerad text.
