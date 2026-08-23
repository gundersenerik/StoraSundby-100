# Vad som måste bytas ut

> Genererad automatiskt av `npm run swap-list`. Redigera inte för hand.
> Senast genererad: 2026-08-23

**8 poster blockerar lansering.** 8 till bör bekräftas.

Varje post motsvarar ett `todo()`-anrop i `config/`. Byt värdet och ta bort
`todo()`-wrappern, så försvinner posten härifrån automatiskt.

## Blockerar lansering

Sajten får inte gå i produktion med dessa värden kvar.

| Var | Nuvarande värde | Vad som behövs |
|---|---|---|
| `club.board.members` | _(7 poster)_ | Webbplatsen anger ordförande plus 7 ledamöter. Endast ordföranden är namngiven där. laget.se listar Isabell Kärrfeldt Andersson (sekreterare), Linn Wolfram, Johan Gallardo Eriksson och Louise Gyldenlöve — men den listan är inte primärkälla och kan vara inaktuell. Be styrelsen om aktuell uppställning med roller. |
| `club.brand` | `{"primary":"#1B4D3E","secondary":"#F0B429","ink":"#14180F","paper":"#FBFAF5"}` | PÅHITTADE FÄRGER. Hämta de riktiga från klubbdräkten, logotypen och sortimentet i webbshoppen innan designen låses. |
| `club.identity.orgNumber` | `802XXX-XXXX` | Hämtas från Skatteverket (ideella föreningar registreras där, inte hos Bolagsverket). Krävs för Swish Handel, bidragsansökningar och integritetspolicyn. |
| `club.membership.collectsPersonalId` | `true` | Bekräfta med kassören exakt vad LOK-stöd och IdrottOnline kräver. Samla aldrig in mer än det. Kolumnen krypteras med pgcrypto. |
| `club.membership.seasonStartMonth` | `1` | Antaget kalenderår. Bekräfta om medlemsåret följer kalenderår eller säsong — styr när påminnelser går ut och när status sätts till inaktiv. |
| `club.payment.swishNumber` | `123 456 78 90` | Klubbens Swish-nummer för inbetalningar. Används för QR-generering. Måste vara korrekt innan medlemsmodulen går live. |
| `club.rental.prices` | `{"cabinPerNight":1200,"cabinPerNightMember":900,"wholeFacilityPerNight":6000,"cleaningFee":500,"depositRequired":false}` | PÅHITTADE SIFFROR. Kansliet har de riktiga. Måste bytas innan uthyrningsmodulen publiceras — annars offereras fel pris till kunder. |
| `sections.orientering.contactPhone` | _(tomt)_ | Gamla sajten hade tel:07232912217 — elva siffror, ogiltigt. Be om rätt nummer. |

## Bör bekräftas

Sajten fungerar med dessa värden, men de är inte bekräftade av klubben.

| Var | Nuvarande värde | Ursprung | Vad som behövs |
|---|---|---|---|
| `club.contact.coordinates` | `{"lat":59.2833,"lng":16.1667}` | Påhittat värde | Ungefärlig position för Stora Sundby. Ersätt med exakt position för Hammargårdsvägen 1 — används i kartan och i JSON-LD för Place. |
| `club.contact.phone` | _(tomt)_ | Från extern källa | Webbplatsen har inget kanslinummer. laget.se anger 016-621 37. Bekräfta att numret är i bruk innan det publiceras. |
| `club.facility.cabins.count` | `6` | Härlett ur webbplatsen | Härlett ur 48 bäddar delat på 8 per stuga. Webbplatsen skriver aldrig ut antalet stugor. Bekräfta med kansliet. |
| `club.payment.swishHandelNumber` | _(tomt)_ | Påhittat värde | Separat 123-nummer som fås vid tecknande av Swish Handel. Krävs för automatisk aktivering av medlemskap. |
| `club.rental.minNights` | `1` | Påhittat värde | Antaget. Bekräfta om det finns minimikrav vid helger eller läger. |
| `club.shop.mode` | `link-out` | Påhittat värde | Sätts till 'feed' om Tifosi kan leverera produktdata, 'curated' om produkterna underhålls manuellt i admin, annars 'link-out'. Se docs/TIFOSI-FORFRAGAN.md. |
| `club.social.instagramOcr` | `https://www.instagram.com/storasundbygoifocr/` | Från extern källa | OCR-konto som hittades i sökresultat men aldrig nämns på webbplatsen. Bekräfta att sektionen finns innan den publiceras. |
| `sections.ocr.active` | `false` | Från extern källa | Sektionen finns inte på webbplatsen men har ett Instagram-konto. Bekräfta. |

## Så byter du ett värde

```diff
- orgNumber: todo("802XXX-XXXX", {
-   path: "club.identity.orgNumber",
-   note: "Hämtas från Skatteverket.",
-   blocksLaunch: true,
- }),
+ orgNumber: "802461-1234",
```

Kör sedan `npm run swap-list` igen. Posten är borta, och värdet slår igenom
på alla ställen i sajten samtidigt.
