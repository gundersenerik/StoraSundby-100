# Gamla sajten, hämtad hem

Hämtad från `storasundbygoif.com` 2026-08-23 med `npm run inventory:legacy`.

Sajten ligger hos Hemsida24 och bilderna på leverantörens CDN. Ingenting
här kontrolleras av föreningen. Den dagen abonnemanget sägs upp är
originalen borta, och därför ligger de nu i repot i stället.

| Mapp | Innehåll |
|---|---|
| `html/` | Rå HTML per sida, exakt som den levererades |
| `text/` | Brödtexten extraherad, underlag för omskrivningen |
| `bilder/` | 28 originalbilder, oförändrade |
| `inventering.json` | Strukturerad sammanställning per sida |

Materialet är underlag, inte innehåll. Ingenting härifrån publiceras
oredigerat — texten skrivs om enligt röstreglerna i `config/content.ts`,
och bilderna optimeras innan de läggs i Supabase Storage. Originalen
behålls.

## Vad mätningen visade

Alla siffror nedan är mätta, inte uppskattade.

| Mätning | Resultat |
|---|---|
| Sidor | 12 |
| Brödtext totalt | 6 609 tecken |
| Kortaste sidan | `/webbshop`, 201 tecken |
| Längsta sidan | `/om-föreningen`, 916 tecken |
| Sidor med `<h1>` | 0 av 12 |
| Sidor utan meta description | 12 av 12 |
| Dubblerade sidtitlar | 11 av 12 |
| Bilder (`<img>`-taggar) | 39 |
| Unika bilder | 28 |
| Bilder utan alt-text | 27 av 28 |

## Två avvikelser mot master-prompten

Prompten anger att 27 av 39 bilder (69 %) saknar alt-text. Mätningen visar
att de 39 taggarna pekar på 28 unika bilder, varav 27 saknar alt-text. Rätt
siffra är alltså **96 %, inte 69 %**. Skillnaden uppstår för att samma
bilder återanvänds i sidhuvud och sidfot på flera sidor.

Prompten anger att startsidan har `content=""` i sin meta description och
att övriga saknar den helt. Mätningen visar att **ingen av de tolv sidorna**
har en meta description som går att läsa ut.

## Bekräftat av mätningen

- Startsidans titel är `startsida` i gemener. Övriga elva har identisk titel.
- Noll `<h1>` på samtliga tolv sidor.
- Länken till webbshoppen går över `http://`, inte `https://`.
- `tel:07232912217` finns kvar och har elva siffror. Se A6 i `docs/TILL-KLUBBEN.md`.
- Tre av fem telefonlänkar är korrekt formaterade med `+46`, två är det inte.

## Köra om

```bash
npm run inventory:legacy
```

Idempotent. Bilder som redan finns laddas inte ner igen. Kör den igen inför
växlingen, så att inget innehåll som lagts till under tiden går förlorat.
