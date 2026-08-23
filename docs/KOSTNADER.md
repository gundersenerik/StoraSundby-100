# Kostnader

Vad sajten kostar att driva, och när det ändras.

Föreningen har ingen it-budget, så varje krona i månadskostnad ska vara
motiverad. Siffrorna nedan är verifierade mot vad som faktiskt är uppsatt,
inte hämtade ur en prislista.

**Månadskostnad idag: 0 kr.**

| Tjänst | Nivå | Kostnad | Kommentar |
|---|---|---|---|
| Vercel | Pro (befintligt konto) | 0 kr extra | Beställaren har redan Pro för andra projekt. Projektet ligger där. |
| Supabase | Free | 0 kr | Projekt `storasundby-100`, region eu-north-1 Stockholm. |
| Domän | Befintlig | – | Redan betald av föreningen. |
| GitHub | Free | 0 kr | Publikt repo, Actions ingår. |
| Resend | Ej uppsatt | 0 kr | 3 000 mejl/mån gratis när det behövs. Se nedan. |

## Varför Vercel Pro spelar roll

Det är inte bara en prestandafråga. Vercels Fair Use Guidelines förbjuder
betalningshantering på Hobby-planen, även för ideella föreningar och
donationer. Medlemsavgifter via sajten kräver alltså Pro.

Eftersom beställaren redan har Pro för andra projekt kostar det föreningen
ingenting. **Men det är en beroendeställning värd att skriva ned:** flyttas
projektet någon gång till ett eget konto måste det bli Pro, inte Hobby,
och då tillkommer cirka 20 USD per månad.

## Två risker med Supabase Free

**Inga backuper. Alls.** Free-nivån har ingen automatisk säkerhetskopiering.
Går databasen förlorad finns medlemsregister och bokningar ingenstans.

Migrationerna ligger i git, så *schemat* går att återskapa. Datan gör det
inte. Detta är den enskilt största driftrisken i projektet just nu, och den
växer varje dag som verkligt innehåll läggs in.

Två vägar: schemalägg `supabase db dump` till extern lagring, eller
uppgradera till Pro för cirka 25 USD per månad, vilket ger sju dagars
dagliga backuper. Dumpen är gratis och räcker långt för en förening.

**Projektet pausas efter sju dagars låg aktivitet.** Varning kommer ungefär
en vecka i förväg, så hela förloppet är runt två veckor och avbryts av
trafik. En sajt med dagliga besökare klarar sig, men under utvecklingen —
när ingen besöker den — är risken verklig. En enkel keep-alive löser det.

Ingen av dessa är åtgärdad ännu. Backup är beslutad att lösas senare.

## När kostnader tillkommer

| Utlösare | Tjänst | Ungefärlig kostnad |
|---|---|---|
| Medlemsportalen går live | Resend | 0 kr upp till 3 000 mejl/mån |
| Egen avsändardomän för mejl | Resend | 0 kr, kräver DNS-poster |
| Swish Handel tecknas | Bank | 60–85 kr/mån + ca 2 kr per transaktion |
| Stripe används i stället | Stripe | 0 kr fast, rörlig avgift per transaktion |
| Databasen behöver backuper | Supabase Pro | ca 25 USD/mån |
| Bilder och dokument växer | Supabase Storage | Ingår i Free upp till 1 GB |

Swish Handel kräver dessutom organisationsnummer, föreningskonto, stadgar
och årsmötesprotokoll. Räkna med veckor, inte dagar. Se B2 i
`TILL-KLUBBEN.md`.

## Rekommendation

Kör Free tills sajten har riktigt innehåll och riktiga medlemmar. Sätt upp
en schemalagd dump innan medlemsregistret börjar fyllas — det är den punkt
där en förlorad databas går från irriterande till allvarlig.

Uppgradera till Supabase Pro först när någon av dessa stämmer: föreningen
har personuppgifter i systemet som inte finns någon annanstans, eller
någon behöver kunna återställa till en punkt i tiden.
