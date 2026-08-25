# Stora Sundby GoIF – färgprofil 1.0

Datum: 24 augusti 2026  
Källa: [storasundbygoif.com](https://storasundbygoif.com/)  
Syfte: färggrund för ett sammanhållet, tillgängligt designsystem.

## Sammanfattning

Webbplatsens faktiska visuella identitet är mycket koncentrerad: mörk marin, vitt och kontrollerade transparenser av dessa två färger. `#001D3B` är den tydliga huvudkulören. `#094B92` och `#F1F1F1` är explicita globala temafärger i källan, men syns inte tydligt på den renderade startsidan.

Den kompletta systemprofilen behåller dessa verifierade ankare och utökar dem med:

- en Navy-skala för digital identitet och gränssnitt,
- en separat Royal/Cobalt-skala för föreningsmärket,
- en blåtonad neutral skala,
- tillgängliga statusfamiljer,
- semantiska tokens för ljus och mörk vy,
- action-, focus-, selection-, overlay- och datavisualiseringstokens.

Alla tillägg är märkta som rekommenderade. De ska inte förväxlas med färger som observerats på webbplatsen.

## 1. Vad som faktiskt finns på startsidan

### Synliga, computed färger

| Värde | Faktisk användning | Beslut i designsystemet |
|---|---|---|
| `#001D3B` | Rubriker, footer, hamburger/X, nav hover/fokus och bildöverlägg | Primär digital brand/ink, Navy 900 |
| `#FFFFFF` | Sidytor, header, kortytor, invers text och ikoner | Neutral 0 och text inverse |
| `rgba(0,29,59,.75)` | Navigation och brödtext på vitt | Materialiseras som `#40566C` för text secondary |
| `rgba(255,255,255,.875)` | Dämpad footertext | Materialiseras som `#DFE3E7` på Navy 900 |
| `rgba(0,29,59,.65)` | Navy-overlay över informationsbandets foto | Behålls som overlay image |
| `transparent` | Nollställda bakgrunder och kanter | Endast där en komponent verkligen ska vara transparent |
| `#000000` | Generiskt/inherited browservärde | Inte en bärande varumärkesfärg |

Startsidan använder inga synliga CSS-gradienter, färgade kortkanter eller box-skuggor. Hero-bildspelet har ingen tint eller overlay. Navy-overlayn ligger på det separata informations-/socialbandet. Mobilvyn använder samma färgsystem som desktop.

### Deklarerade globala temafärger

| Källtoken | Värde | Förekomst CSS + inbäddad SVG | Roll |
|---|---:|---:|---|
| `--color-dark` | `#001D3B` | 250 | Mörka ytor, rubriker, länkar och overlay |
| `--color-accent` | `#094B92` | 76 | Accentytor, aktiva kontroller och knappfamilj |
| `--color-spare` | `#F1F1F1` | 28 | Sekundär ljus yta |
| `--color-light` | `#FFFFFF` | 353 | Ljus bakgrund och innehåll på mörkt |

Det kompilerade temat innehåller totalt 115 deterministiska, normaliserade färgvärden. Många hör till inaktiva komponenter, tillstånd, ramverkskod eller skuggor och har därför inte lyfts upp till varumärkespaletten. Samtliga finns i `raw-color-inventory.csv`.

### Logotypens klubbkulör

Den komprimerade rasterlogotypen visar en tydlig cobalt/royal blue. Representativ pixelprovning gav cirka `#1424A8`, men mätningen varierar mellan pixlar och renderingsstorlekar. Färgen är därför:

- observerad som klubbkulör,
- preliminärt satt till Royal 700,
- endast avsedd för brand-mark/campaign-accent tills en vektorlogotyp eller officiell färgspecifikation finns.

Fotografiernas gröna, orange, röda, beige och elektriskt blå toner är innehållsfärger, inte designsystemtokens.

## 2. Rekommenderad kärnpalett

### Brandankare

| Namn | HEX | RGB | HSL | Status och huvudroll |
|---|---:|---:|---:|---|
| Deep Navy | `#001D3B` | `0 29 59` | `210.5° 100% 11.6%` | Exakt observerad · primär identitet, rubrik, footer, inverse surface |
| Digital Blue | `#094B92` | `9 75 146` | `211.1° 88.4% 30.4%` | Exakt deklarerad · länkar, actions, valda kontroller |
| Cobalt | `#1424A8` | `20 36 168` | `233.5° 78.7% 36.9%` | Preliminärt rasterprov · föreningsmärke och selektiv campaign-accent |
| Spare | `#F1F1F1` | `241 241 241` | `0° 0% 94.5%` | Exakt deklarerad · sekundär ljus yta |
| White | `#FFFFFF` | `255 255 255` | `0° 0% 100%` | Exakt observerad · standardyta och inverse content |

HEX/RGB är skärmmastern. CMYK, spot/Pantone och tryckprofil är medvetet inte angivna: de ska hämtas från föreningens eller tryckeriets original, inte gissas från en JPG eller konverteras utan vald ICC-profil.

### Navy 50–950

`#F2F7FC` · `#DDEAF7` · `#B9D2EA` · `#8BB4DC` · `#6695C4` · `#4778AD` · `#094B92` · `#083F7A` · `#052D59` · `#001D3B` · `#001225`

Använd 50–200 för subtila ytor och selection, 300–500 för grafik och dark-theme accents, 600 för primär action, 700 för hover och 900 för brand/ink.

### Royal/Cobalt 50–950

`#F2F4FF` · `#E2E7FF` · `#C7D0FF` · `#A4B2FF` · `#7D8CF6` · `#5868E2` · `#3346C8` · `#1424A8` · `#101C82` · `#0C155F` · `#070B35`

Royal ska vara en identitetsaccent, inte en parallell standardfärg för knappar och länkar. Det förhindrar att UI och klubbmärke konkurrerar visuellt.

### Neutral 0–1000

`#FFFFFF` · `#F8FAFC` · `#F1F1F1` · `#E4E8EC` · `#CFD6DD` · `#AAB5C0` · `#7A8998` · `#596A7B` · `#40566C` · `#263E56` · `#152B42` · `#0A1724` · `#000000`

Neutralerna är lätt blåtonade för att harmoniera med Navy. `#40566C` är den fasta motsvarigheten till webbplatsens 75-procentiga navytext på vitt.

## 3. Semantiska huvudtokens – light

| Roll | Token | Värde |
|---|---|---:|
| Canvas | `color-bg-canvas` | `#FFFFFF` |
| Subtle background | `color-bg-subtle` | `#F8FAFC` |
| Muted surface | `color-surface-muted` | `#F1F1F1` |
| Primary text | `color-text-primary` | `#001D3B` |
| Secondary text | `color-text-secondary` | `#40566C` |
| Muted text | `color-text-muted` | `#596A7B` |
| Inverse text | `color-text-inverse` | `#FFFFFF` |
| Link | `color-link-default` | `#094B92` |
| Link hover | `color-link-hover` | `#083F7A` |
| Link visited | `color-link-visited` | `#1424A8` |
| Border subtle | `color-border-subtle` | `#E4E8EC` |
| Border default | `color-border-default` | `#CFD6DD` |
| Focus ring | `color-focus-ring` | `#005FCC` |
| Selection | `color-selection-bg/text` | `#DDEAF7` / `#001D3B` |
| Image overlay | `color-overlay-image` | `rgba(0,29,59,.65)` |
| Scrim | `color-overlay-scrim` | `rgba(0,29,59,.80)` |

## 4. Interaktiva tillstånd

| Komponent | Default | Hover | Pressed | Innehåll |
|---|---:|---:|---:|---:|
| Primary action | `#094B92` | `#083F7A` | `#001D3B` | `#FFFFFF` |
| Secondary action | `#FFFFFF` | `#F2F7FC` | `#DDEAF7` | `#094B92` + border |
| Ghost action | Transparent | Navy 10 % | Navy 10 % + pressed state | `#094B92` |
| Danger action | `#9F1C2C` | `#841B29` | `#701C27` | `#FFFFFF` |
| Disabled | `#CFD6DD` | – | – | `#596A7B` |

Fokus ska alltid markeras utöver färgskiftet. Använd minst 2 px ring med `#005FCC` på ljusa ytor. I mörkt tema används Navy 300 (`#8BB4DC`).

Webbtemats generiska formfokus `#129FEA` har bara 2,93:1 mot vitt och bör inte bli designsystemets fokusfärg. `#005FCC` ger 5,98:1 mot vitt.

## 5. Statusfärger

| Status | Bakgrund | Text | Border | Icon |
|---|---:|---:|---:|---:|
| Success | `#ECFDF5` | `#075034` | `#A7F3D0` | `#0B7D50` |
| Warning | `#FFF8E6` | `#6F3D0B` | `#FFDC80` | `#A96300` |
| Error | `#FFF1F2` | `#841B29` | `#FFC6CB` | `#C32336` |
| Info | `#F2F7FC` | `#052D59` | `#B9D2EA` | `#094B92` |

Status ska alltid uttryckas med text eller ikon utöver färg. Hela 50–950-skalor för Success, Warning och Error finns i tokenfilerna.

## 6. Dark theme

Mörkt tema är en rekommenderad utbyggnad; den nuvarande startsidan är ljus.

- Canvas: Navy 950 `#001225`
- Standard surface: Navy 900 `#001D3B`
- Raised surface: Navy 800 `#052D59`
- Primary text: `#FFFFFF`
- Secondary text: `#DFE3E7`
- Muted text: `#99A5B1`
- Link: Navy 300 `#8BB4DC`
- Primary action: Navy 200 `#B9D2EA` med Navy 900-text
- Focus ring: Navy 300 `#8BB4DC`

Dark-theme-mappningarna finns färdiga i `.ssg-theme-dark` i `tokens.css` och i `semantic.dark` i `tokens.json`.

## 7. Kontrastkontroll

WCAG-kontrast för centrala kombinationer:

| Förgrund / bakgrund | Kontrast | Bedömning |
|---|---:|---|
| `#001D3B` / `#FFFFFF` | 16,95:1 | AAA normal text |
| `#40566C` / `#FFFFFF` | 7,59:1 | AAA normal text |
| `#FFFFFF` / `#094B92` | 8,63:1 | AAA normal text |
| `#FFFFFF` / `#083F7A` | 10,49:1 | AAA normal text |
| `#FFFFFF` / `#4778AD` | 4,61:1 | AA normal text; inte AAA |
| `#1424A8` / `#FFFFFF` | 11,37:1 | AAA, men kulören är preliminär |
| `#DFE3E7` / `#001D3B` | 13,14:1 | AAA normal text |
| `#005FCC` / `#FFFFFF` | 5,98:1 | Godkänd text och UI-fokus |
| `#129FEA` / `#FFFFFF` | 2,93:1 | Underkänd som ensam fokusindikator |

Vit text på Navy 500 (`#4778AD`) ligger nära AA-gränsen. För små knapptexter ska Navy 600 eller mörkare föredras för större säkerhetsmarginal.

## 8. Datavisualisering

Ljus grundserie, i stabil ordning:

1. `#094B92` Digital Blue
2. `#1424A8` Cobalt
3. `#0B7D50` Green
4. `#A96300` Amber
5. `#C32336` Red
6. `#0E7480` Teal
7. `#6A3FB5` Violet
8. `#8A3F6A` Berry

Alla åtta har minst 4,5:1 mot vitt. Använd aldrig enbart färg för att skilja serier; kombinera med direkt etikett, form eller linjestil. Dark-theme-varianter finns i tokenfilen.

## 9. Regler för användning

### Gör

- Använd semantiska tokens i komponenter, inte råa HEX-värden.
- Låt Navy 900 bära identiteten och Navy 600 bära actions.
- Använd fasta `#40566C` och `#DFE3E7` för normal text i stället för alfa när bakgrunden kan variera.
- Behåll alfa för overlays, scrims och tunna avdelare.
- Använd Cobalt sparsamt tills originalkulören är verifierad.
- Kontrollera alltid verklig förgrund mot verklig bakgrund efter komposition.

### Undvik

- Att göra svart `#000000` till primär textfärg; Navy 900 är identitetsbäraren.
- Att lyfta fotografiernas färger till globala tokens.
- Att använda Royal/Cobalt som en andra standardfärg för alla UI-actions.
- Att använda den ljusa fokusfärgen `#129FEA` ensam på vitt.
- Att lägga vit liten text på Navy 400 eller ljusare.

## 10. Levererade filer

- `tokens.css` – kompletta primitives och semantiska light/dark-tokens.
- `tokens.json` – maskinläsbar tokenmotsvarighet med ursprungsmetadata.
- `contrast-report.csv` – 27 verifierade light/dark-kombinationer och gränsvärden.
- `raw-color-inventory.csv` – alla 115 deterministiska färger i CSS och inbäddade SVG:er.
- `raw-color-inventory-appendix.md` – teknisk evidens, förekomster och selektorer.
- `README.md` – denna besluts- och användningsprofil.

## 11. Avgränsning och nästa varumärkesbeslut

Startsidan granskades visuellt i desktop och mobil, inklusive nav hover, tangentfokus och öppen mobilmeny. Den globala huvud-CSS:en och inbäddade SVG:er är tekniskt inventerade. Efter en administrativ browserpolicy-spärr kunde elva undersidor och elva rasterassets inte crawlas/färgsamplas vidare. Huvudtemat täcks, men eventuella sidunika inline-stilar är därför inte verifierade.

Det enda kvarvarande beslutet innan profilen kan kallas brand-master är att ersätta den preliminära Cobalt-kulören med värdet från en officiell vektorlogotyp eller föreningens grafiska original.
