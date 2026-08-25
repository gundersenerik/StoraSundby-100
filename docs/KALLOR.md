# Källor

Varje faktapåstående som publiceras på sajten, med källa och hämtdatum.

Regeln är enkel: står det inte här får det inte stå på sajten. En förening
med hundra års historia förtjänar att inte bli tillskriven meriter den inte
har, och kort och sant slår långt och påhittat.

**Klassificering**

- **Bekräftat** — två oberoende källor, eller en officiell. Publiceras.
- **Sannolikt** — en källa av rimlig kvalitet. Publiceras med försiktig
  formulering och listas i `TILL-KLUBBEN.md` för godkännande.
- **Obekräftat** — rykte, härlett eller motstridigt. Publiceras inte.

**Källprincip:** föreningens egen webbplats är primärkälla. Där den och en
extern plattform säger olika saker gäller webbplatsen. Externa källor får
komplettera där webbplatsen tiger, aldrig motsäga där den talar.

Sidorna är hämtade och sparade i `content/legacy/`, så varje rad nedan går
att kontrollera mot originalet även efter att gamla sajten släckts.

---

## Föreningen

| Påstående | Källa | Hämtat | Klass |
|---|---|---|---|
| Fullständigt namn: Stora Sundby Gymnastik och Idrottsförening | `/om-föreningen` | 2026-08-23 | Bekräftat |
| Stiftad 14 juni 1925 | `/om-föreningen` | 2026-08-23 | Bekräftat |
| Ändamålsparagrafen, ordagrant | `/om-föreningen` | 2026-08-23 | Bekräftat |
| Styrelsen består av ordförande plus 7 ledamöter | `/om-föreningen` | 2026-08-23 | Bekräftat |
| Ordförande: Christoffer Fallqvist | `/om-föreningen` | 2026-08-23 | Bekräftat |
| Besöksadress: Hammargårdsvägen 1, 635 34 Stora Sundby | `/kontakta-oss` | 2026-08-23 | Bekräftat |
| E-post: info@storasundbygoif.com | `/kontakta-oss` | 2026-08-23 | Bekräftat |
| Bankgiro 342-8232 | `/bli-medlem` | 2026-08-23 | Bekräftat |
| Medlemsavgifter 250 / 300 / 800 kr | `/bli-medlem` | 2026-08-23 | Bekräftat |
| Betalrutin: personnummer anges i betalningen, annars mejlas kansliet | `/bli-medlem` | 2026-08-25 | Bekräftat |
| Medlemsförmåner: aktiviteter, försäkring under aktiviteter, "Tackförhjälpen"-fester, tillhörighet | `/bli-medlem` | 2026-08-25 | Bekräftat |
| Organisationsnummer 818000-3694 | allabolag.se + laget.se | 2026-08-24 | Bekräftat |
| Ordförandens telefon 070-543 71 33 | `/om-föreningen` (tel-länk i html) | 2026-08-25 | Bekräftat |
| Facebook: facebook.com/storasundbygoif | startsidans sociala ikoner | 2026-08-25 | Bekräftat |
| Instagram: instagram.com/storasundbygoif | startsidans sociala ikoner (sameAs) | 2026-08-25 | Bekräftat |
| Webbshoppen drivs av Tifosi: tifosi.se/storasundbygoif | `/webbshop` (länken i html) | 2026-08-25 | Bekräftat |

**Om Instagram-stavningen.** Sidfotens brödtextlänk på gamla sajten stavade
`storasunbygoif` (utan d), men startsidans sociala ikoner och Hemsida24:s
sajtkonfiguration anger båda det rättstavade `storasundbygoif` — rättelsen
är alltså belagd i primärkällan, inte en gissning.

**Skolans namn är obelagt.** Gamla sajten skriver bara "skolan", "skolans
gympasal" och "skolans idrottshall" — aldrig ett namn. Namnet i config är
wrappat i `todo()` och publiceras inte förrän det bekräftats mot kommunen.

**Om organisationsnumret.** Det stod tidigare som ej publicerbart, eftersom
det saknas på webbplatsen. Numret finns däremot i två oberoende externa
källor, och källprincipen tillåter externa källor att komplettera där
webbplatsen tiger — de motsäger ingenting här.

[allabolag.se](https://www.allabolag.se/8180003694) anger STORA SUNDBY
GYMNASTIK- O IDROTTSFÖRENING, ideell förening, Hammargårdsvägen 1,
635 34 Stora Sundby, registrerad 1971-01-01. Det avgörande är att adress
och postnummer matchar webbplatsen exakt, och alltså inte laget.se:s
avvikande 640 40 — posten avser samma förening.
[laget.se](https://www.laget.se/Stora-Sundby-GOIF/Contact) anger samma
nummer. Kontrollsiffran stämmer enligt Luhn, vilket ett enhetstest bevakar.

Numret publiceras därmed i strukturerad data. Det står ändå kvar som
`todo()` under "bör bekräftas", eftersom det ska in i en bankansökan och i
integritetspolicyn — se A1 i `TILL-KLUBBEN.md`.

**Publiceras inte:** kanslitelefon 016-621 37 finns bara på laget.se, som
inte är primärkälla — se B4 i `TILL-KLUBBEN.md`.

## Sektioner

| Påstående | Källa | Hämtat | Klass |
|---|---|---|---|
| Fotboll är aktiv över hela året, försäsong inomhus | `/fotboll` | 2026-08-23 | Bekräftat |
| Orienteringen har en liten skara aktiva som tävlar i närområdet | `/orientering` | 2026-08-23 | Bekräftat |
| Barn- och ungdomsorientering återupptogs hösten 2023 | `/orientering` | 2026-08-23 | Bekräftat |
| Emelie Gustafsson leder barn- och ungdomsverksamheten | `/orientering` | 2026-08-23 | Bekräftat |
| Johan Ryding är kontakt för orienteringen | `/orientering` | 2026-08-23 | Bekräftat |
| Barngymnastik två pass i veckan i skolans gympasal | `/gymnastik` | 2026-08-23 | Bekräftat |
| Åldersgrupper 3–5 år och 6–8 år | `/gymnastik` | 2026-08-23 | Sannolikt |
| Seniorer 55+ tränar en gång i veckan, övriga vuxna två | `/gymnastik` | 2026-08-23 | Bekräftat |
| Deltagare 15 år eller yngre kräver medföljande vuxen | `/gymnastik` | 2026-08-23 | Bekräftat |
| Padelbanan är öppen för alla och bokas via Playtomic | `/padel` | 2026-08-23 | Bekräftat |
| Elljusspåret spåras när snön tillåter | `/skidor` | 2026-08-23 | Bekräftat |

**Åldersgrupperna klassas som sannolika**, inte bekräftade: startsidan anger
2–4 och 5–8 år, sektionssidan 3–5 och 6–8. Webbplatsen motsäger sig själv.
Vi följer sektionssidan, som är mer specifik. Se C2 i `TILL-KLUBBEN.md`.

**Publiceras inte:** OCR som sektion. Ett Instagram-konto finns, men
sektionen nämns ingenstans på webbplatsen. Se C3.

## Träningstider

| Påstående | Källa | Hämtat | Klass |
|---|---|---|---|
| Samtliga tider för fotboll och gymnastik | `/` (startsidan) | 2026-08-23 | Sannolikt |
| Bollek från 2022 ligger på uppehåll | `/` | 2026-08-23 | Bekräftat |
| Orienteringen ligger på uppehåll | `/` | 2026-08-23 | Bekräftat |

**Klassade som sannolika** eftersom startsidan inte anger någon säsong. Vi
vet inte om tiderna gäller nu eller är kvar sedan i våras. Sidan säger det
rakt ut till besökaren i stället för att låta säkrare än vi är. Se C1.

## Anläggningen

| Påstående | Källa | Hämtat | Klass |
|---|---|---|---|
| Två 11-mannaplaner i gräs | `/läger` | 2026-08-23 | Bekräftat |
| Stugor med 8 bäddar vardera, totalt 48 personer | `/uthyrning`, `/läger` | 2026-08-23 | Bekräftat |
| En stuga tillåter hund | `/uthyrning` | 2026-08-23 | Bekräftat |
| Skolan och idrottshallen kan nyttjas vid större läger | `/läger` | 2026-08-23 | Bekräftat |
| Läger kan välja självhushåll eller lagad och serverad mat | `/läger` | 2026-08-23 | Bekräftat |
| Stugor hyrs för övernattning, "perfekt vid en större fest eller långväga besök" | `/uthyrning` | 2026-08-23 | Bekräftat |
| Antal stugor: sex | härlett ur 48 ÷ 8 | 2026-08-23 | Obekräftat |

**Antalet stugor skrivs aldrig ut som ett påstående.** Det är uträknat,
inte utskrivet — se B3. Bokningsflödet behöver dock bokningsbara objekt,
så sex stugor ligger som data med tillfälliga namn och byts på en rad när
kansliet svarat. Avvägningen står i `BESLUTSLOGG.md` 2026-08-24. Vilken
stuga som tillåter hund är medvetet omärkt tills B3 är besvarad.

## Historia

Samtliga påståenden på `/om-foreningen/historia`. Uppgifter ur en enda
källa attribueras i sidans löptext ("enligt seriearkiven", "skrev
Eskilstuna-Kuriren") så att läsaren ser varifrån de kommer. Varje källa
nedan är öppnad och kontrolläst 2026-08-25 av två oberoende granskare.

| Påstående | Källa | Hämtat | Klass |
|---|---|---|---|
| Herrlaget i seriespel, med uppehåll, 1930–31 till 2015, mest division 6–7, hemmaplan Hammargärdet | [svenskafotbollsklubbar.se](https://svenskafotbollsklubbar.se/showclub.php?clubid=9268) | 2026-08-25 | Attribuerat |
| Damlag i seriespel periodvis 1972–2010, högst division 4 (1985–1990) | [svenskafotbollsklubbar.se](https://svenskafotbollsklubbar.se/showclub.php?clubid=9268) | 2026-08-25 | Attribuerat |
| Arne Hall drivande bakom Hammargärdets IP och lägercamp; uttagen i orienteringslandslaget 1976; avled 2015 | [Minnesord, Eskilstuna-Kuriren 2015-08-04](https://www.ekuriren.se/familj/personligt/artikel/arne-hall/jodw2myr) | 2026-08-25 | Bekräftat |
| 200 000 kr i kommunbidrag 2014 för att rusta elljusspåret; "viktig landsbygdssatsning" | [Eskilstuna-Kuriren 2014-08-15](https://www.ekuriren.se/nyheter/eskilstuna/artikel/stora-sundby-goif-far-bidrag-till-elljusspar/jv8m8eor) | 2026-08-25 | Bekräftat |
| Padelbana byggd sommaren 2021 av fyra eldsjälar, initiativ Rickard Granander, vid Hammargärdets IP | [Eskilstuna-Kuriren 2021-08-11](https://ekuriren.se/artikel/rx154g8l) | 2026-08-25 | Bekräftat |
| En av fyra föreningar bakom Hitta ut i Eskilstuna 2021 | [Strengnäs Tidning 2021-06-28](https://www.strengnastidning.se/nyheter/eskilstuna/artikel/orientering-for-alla-nu-finns-hitta-ut-i-eskilstuna/lwp8n7wr) | 2026-08-25 | Bekräftat |
| Medlemsklubb i Södermanlands orienteringsdistrikt; registrerad i Eventor | [orientering.se, distriktets klubblista](https://www.orientering.se/sodermanland/trana-tavla/trana/klubbar-i-distriktet/) + [Eventor](https://eventor.orientering.se/ranking/ol/club/index/353) | 2026-08-25 | Bekräftat |
| Fem åkare anmälda för föreningen till Vasaloppet 2026 | [Newsworthy (Vasaloppets anmälningslista)](https://www.newsworthy.se/artikel/399392/) | 2026-08-25 | Attribuerat |
| Initiativ till Facebookgruppen Stora Sundby Samhälle maj 2025 tillsammans med slottet och hembygdsföreningen | [Stora Sundby slott på Facebook, publikt inlägg 2025-05-07](https://www.facebook.com/storasundbyslott/) | 2026-08-25 | Bekräftat |

**Publiceras inte: sammanslagningen 1932.** svenskafotbollsklubbar.se
anger att klubben "bildades 1932 efter en sammanslagning mellan Stora
Sundby IF och Öja GF" och att damlaget senare bytte namn till Stora
Sundby GIF/Valskog IK. Uppgiften är intressant men kommer från en
entusiastdatabas utan angivna källor, och årtalet motsäger webbplatsens
stiftelsedatum 14 juni 1925 — källprincipen säger att webbplatsen vinner.
Frågan ligger hos klubben som C8 i `TILL-KLUBBEN.md`.

**Researchspår för framtiden.** Hembygdsårsboken Sörmlandsbygden 1949
innehåller enligt [Eskilstuna kommuns register](https://www.eskilstuna.se/download/18.22acd6711784a1f3a5b117e0/1617169772352/)
en artikel av Nils Dencker om idrott, lek och spel i Öja socken — finns
på Eskilstuna stadsbibliotek. Kan innehålla föreningens tidiga historia.

## Designprofilen

Färg- och typografiprofilerna levererades av Erik 2026-08-25 och ligger i
`content/design/fargprofil/` och `content/design/typografi/`. Båda bygger
på en teknisk inventering av storasundbygoif.com gjord 2026-08-24
(kompilerad CSS, computed styles, inbäddade SVG:er).

| Påstående | Källa | Hämtat | Klass |
|---|---|---|---|
| Klubbfärgerna navy `#001D3B` och digitalblå `#094B92` är webbplatsens explicita `:root`-tokens | `content/design/fargprofil/raw-color-inventory-appendix.md` | 2026-08-25 | Bekräftat |
| Vit canvas och `#F1F1F1` som sekundär ljus yta | samma inventering | 2026-08-25 | Bekräftat |
| Logotypens cobalt är ungefär `#1424A8` | rasterprovning av komprimerad logotyp, `content/design/fargprofil/README.md` | 2026-08-25 | Preliminärt — vektorlogotyp efterfrågas i TILL-KLUBBEN D2 |
| Gamla sajten: Open Sans + Open Sans Condensed, ingen H1 på fem granskade sidtyper | `content/design/typografi/current-site-typography-audit.md` | 2026-08-25 | Bekräftat |
| Archivo Variable som gemensam familj, skalor och roller | `content/design/typografi/README.md` — Eriks profilbeslut, inte ett klubbfaktum | 2026-08-25 | Beslut |

## Fotografierna

De publicerade fotona är curerade ur de 28 som hämtades från gamla sajten
(`content/legacy/bilder/`, provenans per sida i
`content/legacy/inventering.json`). Kopiorna i bruk ligger i `bilder/`
med beskrivande filnamn; alt-texterna beskriver bara det som syns och
testas mot röstreglerna i `tests/enhet/bilder.test.ts`.

| Påstående | Källa | Hämtat | Klass |
|---|---|---|---|
| Samtycke till publicering av fotona, inklusive bilder med personer | Erik, i projektsessionen | 2026-08-25 | Bekräftat |
| Skylten "Hammargärdets IP" sitter på klubbstugan | fotot `klubbstugan-hammargardets-ip.jpeg` (gamla `/om-föreningen`) — ytterligare belägg för anläggningsnamnet | 2026-08-25 | Bekräftat |
| Orienteringskartan "Öja Norra 1" anger Stora Sundby GoIF som upphovsman och Arne Hall under kvalitetssäkring | fotot `orienteringskarta-oja-norra.jpeg` (gamla `/orientering`) — stödjer Arne Halls orienteringskoppling i historiken | 2026-08-25 | Bekräftat |
| Det historiska fotot visar att gräsmattan lades för hand | fotot `grasmattan-laggs.jpeg` (gamla `/om-föreningen`) — år, plats och personer är okända och påstås inte; efterlysning i bildtexten | 2026-08-25 | Bekräftat, avgränsat |
| Gamla prislistan (PNG från `/uthyrning`) publiceras INTE | priserna är gatade bakom `priserArPlatshallare()` tills kansliet svarat (A4) | 2026-08-25 | Beslut |

## Mätningar av gamla sajten

Gjorda med `npm run inventory:legacy` 2026-08-23. Underlag, inte
publicerbart innehåll, men spårbart på samma sätt.

| Mätning | Resultat |
|---|---|
| Sidor | 12 |
| Brödtext totalt | 6 609 tecken |
| Sidor med `<h1>` | 0 av 12 |
| Sidor utan meta description | 12 av 12 |
| Unika bilder | 28 (39 `<img>`-taggar) |
| Bilder utan alt-text | 27 av 28 |

## Ännu inte researchat

Föreningens historia 1925–idag är inte påbörjad. Prompten pekar ut
kommunarkiv, Sörmlands Idrottsförbund, lokala tidningsarkiv och
hembygdsföreningar. Sportsliga resultat via everysport och Eventor är inte
heller hämtade.

Ingenting av det publiceras innan det står i den här filen.
