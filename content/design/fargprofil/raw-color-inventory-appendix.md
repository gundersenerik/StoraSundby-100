# Teknisk färginventering – kompakt appendix

## Omfattning och metod

Inventeringen bygger på den lokalt tillgängliga startsides-HTML:en och webbplatsens kompilerade huvud-CSS. Efter att webbläsarens administratörspolicy stoppade vidare åtkomst gjordes inga fler nätanrop. Synkade filer under `sources/` har inte ändrats.

- Kompilerad CSS: 1 080 364 byte.
- CSS-deklarationer: 1 165 färgliteral-förekomster och 115 normaliserade tokenvärden om den webbläsarberoende systemfärgen `ButtonText` räknas med.
- Levererad CSV: 115 deterministiska färger. `ButtonText` är exkluderad och den SVG-exklusiva färgen `#1D1D1B` är inkluderad.
- Inbäddade data-SVG:er: 53 URL-förekomster, 29 unika SVG:er och 93 färgade `fill`/`stroke`-förekomster. Därutöver finns 28 `fill="none"` och 8 `fill-opacity="0.25"`.
- Startsides-HTML: inga inline-färgliteraler och inga inline-`<svg>`-element.
- Startsidan innehåller åtta layout-rader: sex `row--style-light` och två `row--style-dark`. Ingen rad använder `row--style-accent` eller `row--style-spare` explicit.

CSV-filen räknar CSS- och SVG-förekomster var för sig. Ett högt antal betyder att värdet återanvänds brett i det kompilerade temat, inte att färgen syns lika många gånger i den renderade startsidan.

## Vald temapalett

De fyra färgerna nedan är explicit definierade som webbplatsens globala `:root`-tokens och bör därför betraktas som den säkraste källan till den nuvarande färgidentiteten.

| Token i källan | Normaliserat värde | CSS | SVG | Totalt | Teknisk roll |
|---|---:|---:|---:|---:|---|
| `--color-dark` | `#001D3B` | 222 | 28 | 250 | Mörka ytor, rubriker och länkar på ljust, bild-overlay |
| `--color-accent` | `#094B92` | 68 | 8 | 76 | Accentytor, aktiva kontroller och knappfamilj |
| `--color-spare` | `#F1F1F1` | 20 | 8 | 28 | Sekundär ljus yta |
| `--color-light` | `#FFFFFF` | 305 | 48 | 353 | Ljus bakgrund och text/ikoner på mörkt |

Källselektorn är exakt:

```css
:root {
  --color-light: #fff;
  --color-accent: #094B92;
  --color-spare: #f1f1f1;
  --color-dark: #001d3b;
}
```

## Visuellt relevanta härledningar

| Värde | CSS-förekomster | Exempel på roll/selektor |
|---|---:|---|
| `rgba(0, 29, 59, 0.75)` | 58 | Brödtext i `.row--style-light` och `.row--style-spare` |
| `rgba(0, 29, 59, 0.65)` | 63 | Sekundär text och formuläretiketter; navy-baserad bild-overlay använder också 65 % opacitet |
| `rgba(0, 29, 59, 0.50)` | 14 | Platshållartext på ljusa ytor |
| `rgba(255, 255, 255, 0.875)` | 15 | Brödtext på `.row--style-dark` och `.row--style-accent` |
| `rgba(255, 255, 255, 0.60)` | 11 | Platshållar-/sekundärtext på mörka ytor |
| `#083F7A` | 10 | Mörk accentvariant för knappar och kontrasterande accentytor |
| `#4778AD` | 8 | Ljusare stopp i accentgradienter med `#094B92` |
| `#40566C` | 8 | Ljusare stopp i mörka gradienter med `#001D3B` |
| `#F2F2F2` | 10 | Slideshow-platshållare |
| `#EDEDED` | 13 | Formulär- och meddelandeytor |
| `#E4E4E4` | 8 | Sekundära meddelandeytor |
| `#DFDFDF` | 9 | Gradientstopp för light-temat |
| `#D3D3D3` | 8 | Gradientstopp för spare-temat (`lightgray`) |
| `#129FEA` | 1 | Generisk formulärfokusmarkering, inte en vald varumärkestoken |

Viktig selektorevidens:

- `.row--style-light:not(.row--background-type-image)` använder `background:#fff`.
- `.row--style-dark:not(.row--background-type-image)` använder `background:#001d3b`.
- `.row--style-dark.row--background-type-image .row--background-overlay` använder `background:#001d3b; opacity:0.65`.
- `.row--style-light p, ...` använder `color:rgba(0,29,59,0.75)`.
- `.row--style-dark p, ...` använder `color:rgba(255,255,255,0.875)`.
- `.responsiveslideshow .pagination-item.selected .button--pagination` använder `background-color:#094B92`.
- `.row--style-light .widget .button...` använder den mörkare accentvarianten `#083F7A`.

## Tillstånds- och opacitetsskalor i källan

Följande alfavärden är faktiskt definierade i CSS. Siffran inom parentes är antalet CSS-förekomster.

- Navy `#001D3B`: 0.10 (17), 0.15 (4), 0.20 (2), 0.30 (4), 0.35 (4), 0.40 (2), 0.50 (14), 0.55 (1), 0.65 (63), 0.75 (58), 0.80 (11), 0.875 (6), 0.90 (2).
- Accent `#094B92`: 0.40 (2), 0.50 (8), 0.55 (1), 0.75 (1), 0.80 (1).
- Vit `#FFFFFF`: 0.20 (6), 0.30 (8), 0.40 (2), 0.50 (4), 0.55 (1), 0.60 (11), 0.65 (5), 0.70 (2), 0.75 (3), 0.80 (6), 0.875 (15), 0.90 (6).
- Spare `#F1F1F1`: 0.40 (2), 0.50 (4), 0.55 (1), 0.75 (1).
- Svart för skuggor/överlägg: 0.02 (4), 0.025 (7), 0.03 (2), 0.035 (5), 0.05 (8), 0.065 (4), 0.09 (1), 0.10 (1), 0.20 (2), 0.25 (1), 0.30 (3), 0.40 (1), 0.70 (1).

Praktiskt användningsmönster i ett designsystem:

- Brödtext på ljust: navy 75 %.
- Sekundär text/etiketter: navy 65 %.
- Platshållartext på ljust: navy 50 %.
- Brödtext på mörkt: vit 87,5 %.
- Sekundär/platshållartext på mörkt: vit 60–75 %.
- Tunna avdelare: navy eller vit 20–30 %.
- Bildoverlay: navy 65 %.
- Skuggor: svart 2–10 % för de flesta kort och navigationsytor.

## Semantiska ramverksfärger

Följande värden finns i CSS men ska inte automatiskt behandlas som varumärkesfärger:

- Fokus: `#129FEA`.
- Fel/ogiltigt fält: `rgba(215, 58, 48, 0.651)` och `rgba(215, 58, 48, 0.349)`.
- Ej tillgänglig/slutsåld: `#F5E2E2`, `#D48383`, `#A13737`.
- Bokningsfel: `rgba(184, 13, 13, 0.75)` och `#880A0A`.
- `ButtonText` förekommer en gång som webbläsarens systemfärg i en Firefox-fokusregel. Den är inte deterministisk och ingår därför inte som en färgrad i CSV:n.

## SVG- och bildtillgångar

De inbäddade SVG:erna i CSS är fullständigt inventerade. Färgade SVG-förekomster:

- `#FFFFFF`: 48
- `#001D3B`: 28
- `#094B92`: 8
- `#F1F1F1`: 8
- `#1D1D1B`: 1, för stäng-/ta bort-ikon i varukorgen

Startsidan refererar till elva unika rasterbilder: tio via `<img>` och sex som CSS-bakgrunder, där fem är samma slideshowbilder som redan finns som `<img>`. Dessa rasterbilder kunde inte hämtas eller färgsamplas efter policyspärren. Därför ska inventeringen inte tolkas som en komplett palett över fotografiernas pixelfärger eller logotypbildens exakta rastervärden.

## Ej verifierade sidmallar

Startsidan länkar till elva interna undersidor som inte kunde crawlas efter policyspärren:

`/orientering`, `/fotboll`, `/padel`, `/gymnastik`, `/skidor`, `/läger`, `/uthyrning`, `/webbshop`, `/om-föreningen`, `/kontakta-oss`, `/bli-medlem`.

Huvud-CSS:en är global och innehåller därför deras möjliga komponentfärger, men eventuella sidunika inline-stilar eller andra stylesheets på dessa undersidor är inte verifierade.
