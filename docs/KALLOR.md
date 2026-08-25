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
