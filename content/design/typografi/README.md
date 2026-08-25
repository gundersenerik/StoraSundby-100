# Stora Sundby GoIF – typografiprofil 1.0

Datum: 24 augusti 2026  
Källa för nuläge: [storasundbygoif.com](https://storasundbygoif.com/)  
Syfte: ett modernt, idrottsligt, responsivt och tillgängligt typsystem för webb, app, sociala mallar och digital föreningskommunikation.

## Sammanfattning

**Rekommendationen är Archivo Variable som gemensam fontfamilj.** Den används normalbred och lugn i brödtext/UI, men smalare och tyngre i rubriker, resultat och kampanjbudskap. Samma familj kan alltså vara både vardaglig och idrottslig.

Det här valet ger:

- en tydlig klubbkaraktär utan att likna en generisk gym- eller e-sportidentitet,
- en familj i stället för två separata fontspråk,
- responsiv bredd (`wdth`) och vikt (`wght`) i en variabelfont,
- äkta kursiv, svensk Latin/Latin-1 samt bredare Latin Extended och definierade sifferroller,
- enklare förvaltning i ett designsystem,
- fri SIL Open Font License 1.1 i den rekommenderade distributionen.

Typografin ska kännas **framåtriktad, fokuserad, inkluderande och jordnära**. Det idrottsliga uttrycket kommer från kontrollerad kondensering, hög vikt, tydlig skala och tabulära siffror – inte från kursiv fartgrafik, hård all-caps eller dekorativa effekter överallt.

## 1. Nuläge på webbplatsen

Webbplatsens kompilerade tema anger i huvudsak:

| Område | Nuvarande deklaration | Bedömning |
|---|---|---|
| Brödtext | Open Sans, 17/31,45 px desktop; vanligen 15,45/28,59 px på mobil, vikt 400 | Läsbar men mobiltexten är ibland onödigt liten, raderna mycket långa och rytmen mycket luftig |
| H1 | Ingen H1 hittades på fem granskade sidtyper | Ett semantiskt och navigeringsmässigt hierarkiproblem; sidtitlarna är H2 |
| H2–H6 | Open Sans Condensed, vikt 700, versaler | Ger sportkänsla men gör nivåerna för lika och långa svenska rubriker tröttande |
| Rubrikradavstånd | Cirka 1,1–1,5 beroende på nivå | Bra grund, men de minsta rubrikerna får nästan brödtextens rytm |
| Navigation | Open Sans, 14/14 px, vikt 600, 1 px tracking, versaler | Tydlig men liten, tät och visuellt daterad |
| Länkar | Understrukna även vid hover | Bra igenkänning; ska behållas och förfinas |
| Fontladdare | HTML refererar även till Playfair Display och Rubik | Ser inte ut att motsvara de familjer som huvudtemat faktiskt efterfrågar; bör städas vid migration |
| Ikonfont | FontAwesome med `font-display: block` | Separat från textsystemet; bör på sikt ersättas med SVG-ikoner för stabilare rendering |

Det som är värt att bevara är **kontrasten mellan kondenserade rubriker och neutral text**. Det som bör ändras är blandningen av fontreferenser, all-caps på samtliga rubriker, den lilla mobiltexten och avsaknaden av tydliga typografiska roller för UI, formulär, tabeller och matchdata.

Startsidan och fyra undersidor kontrollerades vid 1440 och 390 px. Inget synligt overflow hittades, men alla observerade textroller hade `max-width: none`; en artikelrad blev nästan 960 px bred. Hierarkin hoppade bland annat H2 → H5 → H3 → H2 på startsidan. H5 på mobil var dessutom bara cirka 0,3 px större än aktivitetskortens brödtext. Den fullständiga evidensen finns i `current-site-typography-audit.md`.

## 2. Vald familj: Archivo Variable

Archivo är en modern grotesk med tillräcklig personlighet för en förening, men tillräckligt öppna och vardagliga former för information, navigation och formulär. Familjen har variabel vikt `100–900` och bredd `62–125 %`, normal och äkta kursiv samt bred latinsk språkstäckning. Det officiella projektet anger stöd för över 200 språk. [Archivo-projektet](https://github.com/Omnibus-Type/Archivo), [Google Fonts metadata](https://github.com/google/fonts/blob/main/ofl/archivo/METADATA.pb)

### Systemets tillåtna axelvärden

| Roll | Vikt | Bredd | Varför |
|---|---:|---:|---|
| Display/title | 850 | 75 % | Kompakt, snabb och tydligt idrottslig |
| H1 | 800 | 80 % | Stark sidtitel utan affischöverdrift |
| H2 | 750 | 86 % | Tydlig sektionsnivå |
| H3 | 700 | 92 % | Övergång mellan display och UI |
| H4–H6 | 700 | 100 % | Bättre läsbarhet i mindre storlekar |
| Ingress | 400–500 | 100 % | Lugn introduktion |
| Brödtext | 400 | 100 % | Maximal läsbarhet |
| Navigation/länk | 600 | 100 % | Tydlig interaktion utan att bli tung |
| Knapp | 700 | 100 % | Kort, robust handlingsspråk |
| Resultat/statistik | 800–850 | 86 % | Täta siffror med matchkänsla |

Använd CSS-egenskaperna `font-weight`, `font-stretch` och `font-style`. Rå `font-variation-settings` ska bara användas om en framtida specialaxel saknar motsvarande standardegenskap; annars blir arv och fallback svårare att förvalta.

Gå inte ner till familjens ytterläge 62 % för vanliga rubriker. 75 % är systemets lägsta normala bredd; extremvärdet kan reserveras för mycket korta resultatsiffror efter visuell kontroll.

## 3. Varför detta känns modernt 2026

Vår syntes av granskade trendprognoser för 2026 är en rörelse bort från helt neutral “blanding” och mot mer personlighet, mänsklighet och lokal berättelse. Kraftfull displaytypografi, varierade bredder och variabelfonter återkommer som signaler. För Stora Sundby tolkar vi smalare och tyngre former som ett lämpligt visuellt språk för fokus och fart; det är ett estetiskt varumärkesval, inte en bevisad UX-effekt. [Fontfabric – Typography Trends 2026](https://www.fontfabric.com/blog/top-typography-trends-for-2026/), [Adobe – Design Trends 2026](https://www.adobe.com/express/learn/blog/design-trends-2026), [Creative Bloq – Typography Trends 2026](https://www.creativebloq.com/design/fonts-typography/breaking-rules-and-bringing-joy-top-typography-trends-for-2026)

Variabel typografi har brett webbläsarstöd och kan användas i produktion: vikt och bredd kan ligga i en gemensam fil och anpassas till olika roller och ytor. W3C:s CSS Fonts Level 4 är fortfarande ett arbetsutkast, men de relevanta variationsegenskaperna har varit brett tillgängliga i webbläsare sedan 2018. Variabelt betyder inte automatiskt mindre; vinsten måste mätas mot de statiska vikter som annars hade laddats. [MDN – Font variations](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variation-settings), [W3C CSS Fonts Level 4](https://www.w3.org/TR/css-fonts-4/), [web.dev – Best practices for fonts](https://web.dev/articles/font-best-practices)

Stora Sundbys tolkning av trenden ska därför vara disciplinerad:

- uttrycksfull i hero, resultat, affisch och kampanj,
- normalbred och stillsam i längre text och UI,
- enhetlig genom en enda familj,
- fri från tillfälliga dekortrender som blir daterade snabbt.

## 4. Komplett responsiv typskala

Pixelvärdena nedan är referenser vid webbläsarens normala 16 px-bas. Implementationen använder `rem` och `clamp()` så att användarens textinställningar och zoom fortfarande får effekt.

| Roll | Mobil → stor skärm | Vikt / bredd | Radavstånd | Tracking | Maxbredd |
|---|---:|---:|---:|---:|---:|
| Display / title | 48 → 88 px | 850 / 75 % | 0,95 | −0,01 em | 14ch |
| H1 | 40 → 64 px | 800 / 80 % | 1,00 | −0,005 em | 18ch |
| H2 | 32 → 48 px | 750 / 86 % | 1,05 | −0,005 em | 26ch |
| H3 | 26 → 32 px | 700 / 92 % | 1,10 | 0 | 26ch |
| H4 | 22 → 26 px | 700 / 100 % | 1,20 | 0 | 26ch |
| H5 | 20 → 22 px | 700 / 100 % | 1,25 | 0 | – |
| H6 | 18 px | 700 / 100 % | 1,30 | 0 | – |
| Ingress | 18 → 20 px | 400 / 100 % | 1,50 | 0 | 58ch |
| Brödtext, redaktionell | 17 → 18 px | 400 / 100 % | 1,625 | 0 | 66ch |
| Brödtext, UI | 16 px | 400 / 100 % | 1,625 | 0 | 66ch |
| Brödtext liten | 14 px | 400 / 100 % | 1,50 | 0 | 60ch |
| Caption/metadata | 13 px | 400 / 100 % | 1,40 | 0 | 60ch |
| Eyebrow/overline | 13 px | 700 / 100 % | 1,25 | 0,08 em | kort text |
| Resultat/statistik | 36 → 64 px | 850 / 86 % | 1,00 | 0 | – |
| Citat | 20 → 24 px | 500 italic / 100 % | 1,45 | 0 | 58ch |

### Exakta storleksvärden

```css
--ssg-font-size-display: clamp(3rem, 2.25rem + 3.75vw, 5.5rem);
--ssg-font-size-h1: clamp(2.5rem, 2rem + 2.5vw, 4rem);
--ssg-font-size-h2: clamp(2rem, 1.7rem + 1.5vw, 3rem);
--ssg-font-size-h3: clamp(1.625rem, 1.475rem + 0.75vw, 2rem);
--ssg-font-size-h4: clamp(1.375rem, 1.3rem + 0.375vw, 1.625rem);
--ssg-font-size-h5: clamp(1.25rem, 1.2rem + 0.25vw, 1.375rem);
--ssg-font-size-h6: 1.125rem;
--ssg-font-size-lead: clamp(1.125rem, 1.1rem + 0.125vw, 1.25rem);
--ssg-font-size-body-lg: clamp(1.0625rem, 1.0425rem + 0.1vw, 1.125rem);
--ssg-font-size-body: 1rem;
```

Varje flytande storlek kombinerar en zoomvänlig `rem`-bas med en liten viewportdel och tydliga min/max. Använd aldrig enbart `vw`/`cqw` för textstorlek, eftersom det kan göra användarens zoom verkningslös. [web.dev – Responsive and fluid typography](https://web.dev/articles/baseline-in-action-fluid-type)

## 5. UI-, länk- och formulärroller

| Roll | Storlek | Vikt | Radavstånd | Regel |
|---|---:|---:|---:|---|
| Desktopnavigation | 15 → 16 px | 600 | 1,30 | Sentence case, 0,01 em tracking |
| Mobilnavigation | 20 px | 700 | 1,30 | Tillåt två rader vid långa namn |
| Länk | Ärver omgivningen | 600 | Ärver | Alltid understruken i löptext |
| Standardknapp | 16 px | 700 | 1,25 | Sentence case, minst 44 px rekommenderad total höjd |
| Liten knapp | 14 px | 700 | 1,25 | Endast där utrymmet är tätt; målytan är fortfarande stor |
| Input/select/textarea | 16 px | 400 | 1,50 | Aldrig mindre på mobil |
| Formlabel | 14 px | 600 | 1,40 | Placeras visuellt nära sitt fält |
| Hjälp-/feltext | 14 px | 400 | 1,50 | Fel anges med text/ikon, inte bara färg; nyckelord kan markeras med `<strong>` |
| Breadcrumb | 14 px | 400 | 1,50 | Kan radbrytas på mobil |
| Tabellrubrik | 13 px | 700 | 1,40 | Sentence case; vänsterställ text |
| Tabellcell | 14–16 px | 400 | 1,50 | Siffror högerställs och görs tabulära |

Länkar använder `text-decoration-thickness: max(.08em, 1px)` och `text-underline-offset: .18em`. Hover får en tjockare linje eller ytterligare visuell signal – inte bara ett subtilt färgskifte.

Fontstorlek och klickyta är separata saker. WCAG 2.2 AA kräver minst 24 × 24 CSS px eller tillräckligt avstånd i de flesta fall; Stora Sundby bör sikta på 44 × 44 px för huvudkontroller på touch. Inline-länkar i löptext är ett undantag från målstorlekskravet. [W3C – Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [W3C – Target Size Enhanced](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced)

## 6. Radlängd, radavstånd och vertikal rytm

### Radlängd

- Längre brödtext: `60–70ch`, standard `66ch`.
- Ingress och citat: högst `58ch`.
- H1: högst `18ch`.
- Display/title: högst `14ch`, gärna 2–4 rader på mobil.
- Vänsterställ löptext. Använd inte marginaljustering.

USWDS anger 45–90 tecken och omkring 66 som ett bra läsmål. WCAG:s AAA-kriterium kräver en mekanism som kan begränsa rader till högst 80 tecken; det är inte ett krav att standardlayouten alltid använder exakt det värdet. [USWDS – Typography](https://designsystem.digital.gov/components/typography/), [W3C – Visual Presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation)

### Vertikal rytm

- Styckeavstånd: `1em` efter stycket; skapa aldrig indrag och stort styckeavstånd samtidigt.
- Rubrik före: cirka `1.5em`; rubrik efter: `0.55em`.
- Listpunkt till listpunkt: cirka `0.35–0.5em` när innehållet är flerradigt.
- Undvik separata `<br>` för att forma löptext. Låt bredd och responsiv layout styra radbrytningen.
- `text-wrap: balance` på korta rubriker och `text-wrap: pretty` på löptext är progressiva förbättringar, inte krav.
- Inga textlådor får ha fast höjd. Det gäller särskilt kort, navigation, knappar och badges.

## 7. Versaler, kursiv, betoning och svenska

- **Sentence case är standard** för H1–H6, navigation, länkar och knappar.
- Versaler används endast för kort eyebrow/kategori, kort matchetikett eller ett mycket kort kampanjord.
- Versal text får `0.08em` tracking. Löptext och små UI-texter får inte negativ tracking.
- Kursiv används för citat, verkstitlar och verklig språklig betoning – inte för långa instruktioner.
- Fetstil används för nyckelord, inte hela stycken.
- Sätt `lang="sv"` på svenska sidor. Då fungerar uppläsning, avstavning och språkregler bättre.
- `hyphens: auto` kan användas i långa svenska texter, men aldrig i navigation, knappar, personnamn eller matchdata.
- Teststräng: `ÅÄÖ åäö – I l 1 | O 0 | B 8 | 12–14 | 18.30 | Stora Sundby GoIF`.

## 8. Idrottsspecifika regler

### Matchresultat, tider och tabeller

Använd `font-variant-numeric: lining-nums tabular-nums` för:

- resultat och live-score,
- tabellställningar,
- tider, datum och startnummer,
- statistik, summor och medlemsavgifter.

Tabulära siffror har samma bredd, så siffror och kolumner inte hoppar när innehållet uppdateras. Siffror ska högerställas i jämförelsetabeller; resultat kan centreras i en särskild scoreboard-komponent.

Detta förutsätter att den versionslåsta WOFF2-filen behåller OpenType-funktionen `tnum`. Kontrollera den faktiska produktionsfilen; om funktionen saknas ska score-/tabellkomponenten använda en verifierad sifferfont eller standardtabulära siffror från fallbackstacken.

### Kampanj och matchgrafik

- Display får vara 75 % bred och 850 i vikt.
- Högst en displayroll per vy eller affisch.
- Frivillig kursiv/lutning får användas i statisk kampanjgrafik, inte som generell webbstandard.
- Animerad bredd eller vikt är dekorativt och måste respektera `prefers-reduced-motion`.
- Logotypen ska inte sättas om i Archivo; originalmärket är alltid originalmärket.

## 9. Semantik och innehållshierarki

Visuell storlek och HTML-nivå är två separata beslut. H1–H6 ska följa dokumentets innehållshierarki. Om ett kort behöver se ut som H5 men logiskt ligger direkt under H2 ska rätt HTML-rubrik användas och den visuella token appliceras separat. [W3C – Headings](https://www.w3.org/WAI/tutorials/page-structure/headings/)

Praktiska regler:

- En tydlig H1 per sida eller primärt innehållsområde.
- Hoppa inte nivåer för att få en viss storlek.
- Länktext beskriver målet; undvik ensamt “Läs mer”.
- Knapptext beskriver handlingen: “Bli medlem”, “Se spelschema”, “Anmäl lag”.
- Metadata får vara mindre, men aldrig bära den enda viktiga informationen.
- Felmeddelanden ska säga vad som hände och hur användaren går vidare.

## 10. Responsivitet och tillgänglighetskrav

Systemet ska godkännas mot följande:

1. **320 CSS px bredd** utan tvådimensionell scroll för vanlig text.
2. **200 % textförstoring** utan att innehåll eller funktion försvinner.
3. **400 % zoom/reflow** på en vanlig desktopviewport.
4. Stående och liggande mobil, långa svenska ord och stora användarinställningar.
5. Användarändrad text spacing: radavstånd `1.5`, styckeavstånd `2em`, teckenavstånd `0.12em`, ordavstånd `0.16em` – utan klippning eller överlapp.
6. Fallbackfont och långsam uppkoppling utan stora layoutskiften.
7. Normal, hover, visited och tydlig tangentbordsfokus för länkar.
8. Textkontrast minst 4,5:1 för normal text och 3:1 för stor text enligt AA.

WCAG:s text-spacingvärden är testvärden som användaren ska kunna tvinga fram; de behöver inte vara sajtens standardinställningar. [W3C – Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing), [W3C – Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow), [W3C – Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)

## 11. Fontladdning, prestanda och CLS

Rekommenderad produktion:

- självhostad WOFF2, versionslåst tillsammans med licensfil,
- upright Archivo Variable med `wght 100–900` och `wdth 62–125`,
- separat variabel italic som bara laddas när kursiv faktiskt används,
- Basic Latin + Latin-1 Supplement för svensk text (`ÅÄÖåäö`) samt behövliga Latin Extended-tecken för europeiska person-/lagnamn,
- `font-display: swap`,
- preload endast för den upright-fil som behövs i första vyn,
- ingen `@import` för produktionsladdning,
- mät verkliga fallbackmått innan `size-adjust`, `ascent-override`, `descent-override` eller `line-gap-override` sätts.

Den 24 augusti 2026 var Google Fonts upright-resurs cirka 90 kB för `latin` och ytterligare cirka 86 kB för `latin-ext`. En sida som behöver tecken ur båda intervallen kan alltså hämta omkring 176 kB; en egen kombinerad subset får en annan storlek och måste mätas. Det är ögonblicksvärden, inte löften om framtida filstorlek. Jämför alltid självhostad fil mot faktisk CDN-resurs i produktion.

Fontfiler ska laddas tidigt, men för många preloads kan konkurrera med viktigare resurser. Fallbackmått och `font-display` måste väljas medvetet för att minska layoutskifte. [web.dev – Best practices for fonts](https://web.dev/articles/font-best-practices), [web.dev – Optimize CLS](https://web.dev/articles/optimize-cls)

## 12. Alternativ som utvärderades

| System | Styrka | Varför det inte vann |
|---|---|---|
| Barlow Condensed + Manrope | Starkast omedelbar arena-/klubbkänsla | Två familjer; Barlow Condensed är statisk i Google Fonts; Google Fonts Manrope är en äldre OFL-distribution utan kursiv medan officiella Manrope V5 från 5 april 2025 har ett separat licensavtal |
| League Spartan + Inter | Tekniskt robust och tydligt sportigt | League Spartan är bred på mobil och kombinationen riskerar ett generiskt fitness-/SaaS-uttryck |
| Nuvarande Open Sans-system | Bekant och läsbart | Svagare egen identitet, blandad fontladdning och alla rubriker i versaler |

Om föreningen senare vill ha ett mer expressivt kampanjlager kan Barlow Condensed prövas enbart för affisch/socialt material. Den ska då vara ett medvetet tillägg, inte ett tredje gränssnittsspråk.

Manrope-jämförelsen avser [Google Fonts-distributionen](https://github.com/google/fonts/blob/main/ofl/manrope/METADATA.pb) respektive [officiella Manrope V5](https://www.sharanda.com/manrope); de ska inte blandas utan versions- och licensbeslut.

## 13. Migration från nuvarande sajt

1. Lägg in versionslåsta Archivo WOFF2-filer och OFL-licensen.
2. Ladda `font-loading.css` före `typography.css`.
3. Mappa Open Sans → Archivo 100 % bredd och Open Sans Condensed → Archivo 75–92 % beroende på nivå.
4. Byt H1–H6 från generell uppercase till sentence case; behåll uppercase bara på definierade eyebrow-/sportetiketter.
5. Höj mobil brödtext från cirka 15,5 px till minst 16 px; använd 17 px för redaktionellt innehåll.
6. Byt navigation från 14 px uppercase till 15–16 px semibold sentence case.
7. Ta bort oanvända eller motstridiga Playfair Display/Rubik/Open Sans-fontladdningar efter verifiering.
8. Separera ikonfonten från typografisystemet och planera byte till SVG.
9. Testa alla acceptanskriterier i avsnitt 10 innan lansering.

## 14. Gör och undvik

### Gör

- Använd namngivna rolltokens i stället för lokala pixelvärden.
- Låt breddaxeln skapa sportkaraktär i stora rubriker.
- Behåll normal bredd i allt som ska läsas snabbt eller länge.
- Använd sentence case som standard.
- Understryk länkar i löptext.
- Använd tabulära siffror i match- och ekonomidata.
- Kontrollera verklig renderad font, fallback, ÅÄÖ och zoom.

### Undvik

- Condensed brödtext eller små formulärtexter.
- Tunna vikter under 24 px.
- Hela stycken i versaler eller kursiv.
- Fontstorlekar som består enbart av viewportenheter.
- Negativ tracking i liten text.
- Fast höjd på textbärande komponenter.
- Att välja H-nivå efter hur stor rubriken ska se ut.
- Att ladda alla axlar, skript och fontfiler utan att mäta behovet.

## 15. Levererade filer

- `README.md` – besluts- och användningsmanualen.
- `typography.css` – kompletta tokens och färdiga typografirecept.
- `font-loading.css` – produktionsmall för självhostad variabelfont.
- `typography-tokens.json` – maskinläsbara familjer, axlar, skala, roller och acceptanskrav.
- `type-scale.csv` – alla 26 roller i tabellformat.
- `current-site-typography-audit.md` – nulägesinventering och migreringsnoteringar.

## 16. Kvar före skarp lansering

Profilen är komplett som designsystembeslut. Före publicering behöver teamet:

- versionslåsa exakt Archivo-build och spara licensfilen,
- testa den valda WOFF2-subsetten mot alla förekommande namn och språk,
- mäta fallbackens typmått och CLS i den verkliga implementationen,
- verifiera score-/tabellkomponenter med den faktiska fontfilens sifferfunktioner,
- göra en innehållsrunda där manuella versaler och hårdkodade radbrytningar tas bort.
