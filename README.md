# StoraSundby-100

Ny digital plattform för **Stora Sundby GOIF**, grundad 14 juni 1925.

Ersätter en tolvsidig Hemsida24-sajt med en komplett föreningssajt: innehåll,
stuguthyrning med bokning, medlemsportal med digital betalning och en
webbshopsupplevelse på egen domän.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres, Auth,
Storage) · Vercel Pro · Resend

## Kom igång

```bash
npm install
cp .env.example .env.local   # fyll i Supabase- och Resend-nycklar
npm run dev
```

## Klubbuppgifter bor på ett ställe

Allt som är ett faktum om föreningen — organisationsnummer, adress,
medlemsavgifter, Swish-nummer, stugpriser, klubbfärger — ligger i
**`config/club.ts`** och ingen annanstans.

Ändrar du organisationsnumret på den raden ändras det samtidigt i sidfoten, i
integritetspolicyn, i strukturerad data och i betalningskonfigurationen.
Ingen komponent får hårdkoda ett klubbfaktum.

### Påhittade värden spårar sig själva

Projektet byggs som ett skelett med dummy-siffror där riktiga uppgifter saknas.
Varje sådant värde wrappas i `todo()`:

```ts
orgNumber: todo("802XXX-XXXX", {
  path: "club.identity.orgNumber",
  note: "Hämtas från Skatteverket. Krävs för Swish Handel och bidragsansökningar.",
  blocksLaunch: true,
}),
```

Det fungerar som ett vanligt värde i koden, men registreras samtidigt.
`npm run swap-list` läser registret och genererar
[`docs/SWAP-LIST.md`](docs/SWAP-LIST.md) — listan över allt som måste bytas ut.

Listan kan alltså aldrig bli inaktuell, eftersom den härleds ur koden i stället
för ur ett dokument någon glömmer uppdatera. Byt värdet, ta bort `todo()`, och
posten försvinner av sig själv.

```bash
npm run swap-list          # generera listan
npm run swap-list:strict   # exit 1 om lanseringsblockerare finns kvar (körs i CI)
```

## Källprincip

`storasundbygoif.com` är primärkälla. Där webbplatsen och en extern plattform
(laget.se, IdrottOnline, everysport) säger olika saker gäller webbplatsen.
Avvikelsen noteras i koden men ändrar inte värdet.

Inget faktapåstående publiceras utan källa. Det som inte går att belägga hamnar
i [`docs/TILL-KLUBBEN.md`](docs/TILL-KLUBBEN.md), inte på sajten.

## Dokumentation

| Fil | Innehåll |
|---|---|
| `docs/MASTER-PROMPT.md` | Hela uppdragsbeskrivningen |
| `docs/SWAP-LIST.md` | Genererad. Vad som måste bytas ut. |
| `docs/TILL-KLUBBEN.md` | Frågor som kräver svar från en människa |
| `docs/BESLUTSLOGG.md` | Arkitekturbeslut med motiv |
| `docs/KALLOR.md` | Varje faktapåstående med källa och datum |
| `docs/KOSTNADER.md` | Vad driften kostar och när det ändras |
| `docs/LANSERING.md` | Checklista för växlingen |
| `docs/GDPR.md` | Ännu inte skriven. Se A8 i TILL-KLUBBEN. |
| `docs/DRIFT.md` | Ännu inte skriven |
