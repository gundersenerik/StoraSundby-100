# Lansering

Checklista för dagen `storasundbygoif.com` ska peka hit i stället för till
Hemsida24.

Ingenting här är gjort ännu. Sajten är inte redo att lanseras — nio
lanseringsblockerare står kvar i `SWAP-LIST.md`, och `npm run
swap-list:strict` vägrar deploya till produktion så länge de gör det.

Listan förs löpande, så att den inte skrivs kvällen före växlingen.

---

## Innan växling

### Innehåll

- [ ] Samtliga nio lanseringsblockerare i `docs/SWAP-LIST.md` besvarade
- [ ] `npm run swap-list:strict` går igenom
- [ ] Klubbens riktiga färger inlagda i `config/design.ts`
- [ ] Logotyp på plats, favicon utbytt (gamla sajten har Hemsida24:s egen)
- [ ] Bilderna optimerade och flyttade till Supabase Storage, originalen kvar
- [ ] Alla bilder har alt-text — gamla sajten hade 27 av 28 utan
- [ ] Historiken researchad, eller sidan medvetet utelämnad
- [ ] `docs/GDPR.md` skriven, integritetspolicyn publicerad

### Teknik

- [ ] `npm run build`, `test`, `test:e2e`, `lint:hardcoded` gröna
- [ ] Lighthouse ≥ 95 på alla fyra kategorier, mobilt, på minst fem sidor
- [ ] axe-core: noll allvarliga fel
- [ ] Samtliga tolv gamla URL:er redirectar, inklusive de med å och ä
- [ ] `sitemap.xml` och `robots.txt` svarar korrekt på skarp domän
- [ ] 404-sidan fungerar på skarp domän

### Konfiguration som inte bor i repot

Det här är den lömska delen. Inställningarna nedan finns bara i
webbgränssnitt, går inte att granska i en pull request, och orsakar fel som
är svåra att felsöka eftersom ingenting i koden är fel.

- [ ] **Supabase Site URL** ändras till `https://storasundbygoif.com`.
      Står den kvar på vercel-adressen pekar alla mejllänkar dit, vilket ser
      oseriöst ut i en förenings utskick. Inget går sönder — det ser bara fel ut.
- [ ] **Supabase Redirect URLs** kompletteras med
      `https://storasundbygoif.com/auth/bekrafta`.
      En adress som inte står i listan ger ingen felmeddelande — användaren
      skickas tyst till Site URL i stället.
- [ ] **Vercel Deployment Protection** stängs av, annars svarar sajten 401
      för alla utom de som är inloggade på Vercel
- [ ] **Vercel-domän** kopplad, DNS pekar rätt, SSL utfärdat
- [ ] `NEXT_PUBLIC_SITE_URL` satt i Vercel till skarp domän
- [ ] **GitHub-secreten `SUPABASE_DB_URL`** tillagd, annars hoppar den
      nattliga backupen tyst över sig själv. Connection-strängen finns i
      Supabase under Project Settings > Database, i session-läge (port
      5432) — transaction pooler fungerar inte för `pg_dump`.

### E-post

- [ ] Resend uppsatt med verifierad avsändardomän
- [ ] SPF, DKIM och DMARC i DNS
- [ ] Provmejl som landar i inkorgen, inte i skräpposten, i Gmail och Outlook

### Behörigheter

- [ ] Klubbens egna administratörer inlagda i `admin_users`
- [ ] Erik Gundersens tillfälliga adminrad borttagen om den inte ska vara kvar
- [ ] Någon i föreningen har tillgång till Supabase, Vercel och GitHub —
      sajten får inte hänga på en enda person

### Drift

- [x] Schemalagd dump byggd i `.github/workflows/backup.yml`. Kör varje
      natt, kontrollerar att dumpen inte är tom, sparar 90 dagar.
      **Free-nivån har inga backuper alls.** Se `KOSTNADER.md`.
- [ ] Secreten `SUPABASE_DB_URL` tillagd så att backupen faktiskt kör —
      se rubriken om konfiguration ovan.
- [ ] Backupen körd minst en gång med grönt resultat, och en dump
      återläst i en engångsdatabas. En backup ingen har återställt är en
      förhoppning, inte en backup.
- [ ] Keep-alive så att projektet inte pausas efter sju dagars låg aktivitet
- [ ] `docs/DRIFT.md` skriven för en volontär
- [ ] Search Console verifierad, sitemap inskickad
- [ ] 404-övervakning

## Vid växling

- [ ] Gamla sajten kvar i luften tills DNS spridit sig
- [ ] `npm run inventory:legacy` körd en sista gång, så att innehåll som
      lagts till under tiden inte går förlorat
- [ ] Styrelsen har granskat på förhandsvisnings-URL
- [ ] Facebook och Instagram uppdaterade med ny adress

## Efter växling

- [ ] Samtliga tolv gamla URL:er kontrollerade i webbläsare, inte bara i test
- [ ] Sökresultat kontrollerade efter en vecka
- [ ] Hemsida24-abonnemanget sagt upp — **först** när allt innehåll och alla
      bilder är hemtagna och verifierade

---

## Teknisk skuld som inte blockerar

Noterad när den upptäcktes, för att inte glömmas bort.

**Middleware bör bli proxy.** Next 16 varnar att `middleware.ts` är på väg
att fasas ut. Migrering: `npx @next/codemod@canary middleware-to-proxy .`
Inget går sönder än.

**GitHub Actions kör på avvecklade Node 20.** `actions/checkout@v4` och
`actions/setup-node@v4` tvingas köra på Node 24 med en varning. Uppdatera
till v5 vid tillfälle.

**Auth-konfigurationen är inte kod.** Site URL och Redirect URLs finns bara
i Supabases dashboard. De borde ligga i `supabase/config.toml`, vilket
kräver att projektet länkas och att migrationer körs med `supabase db push`
i stället för via API:et. Det är ett arbetssätt vi vill ha förr eller
senare ändå.
