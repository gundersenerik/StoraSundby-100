-- ═══════════════════════════════════════════════════════════════════════════
--  Seed 002 — sektionsinnehåll
-- ═══════════════════════════════════════════════════════════════════════════
--
--  Omskrivet från föreningens nuvarande webbplats, sparad i
--  content/legacy/text/. Varje påstående är belagt i docs/KALLOR.md.
--
--  VAD SOM ÄNDRATS, och inget mer:
--  - Versalisering. Gamla sajten växlade mellan "fotboll", "Skidor",
--    "WEBBSHOP" och "barnGYMNASTIK". Nu genomgående versal begynnelsebokstav.
--  - "medans" → "medan".
--  - Bindestreck → kort tankstreck i tidsintervall.
--  - Meningar som slutade mitt i ("kontakta Johan Ryding via telefon .")
--    avslutas ordentligt. Kontaktuppgifterna renderas ur club.ts i stället.
--
--  VAD SOM INTE ÄNDRATS:
--  Rösten. Föreningens egna fraser står kvar ordagrant — "våra fina
--  gräsplaner", "alla gör nytta", "tveka inte, hör av er", "skapa minnen
--  för livet". Ingen mening är omskriven till marknadsföringsspråk, och
--  inget faktum är tillagt.
--
--  Kontaktuppgifter, telefonnummer och adresser förekommer aldrig i texten.
--  De bor i club.ts och renderas av sidan. Skulle de stå här hade vi haft
--  två sanningar, och lint:hardcoded hade sagt ifrån.
-- ═══════════════════════════════════════════════════════════════════════════

update public.sections set
  heading = 'Fotboll',
  intro   = 'Grupper som är aktiva över hela året, från försäsong inomhus till sent in på hösten.',
  body    = 'Fotbollssektionen har grupper som är aktiva över hela året. Försäsongen börjar inomhus, och senare på våren tar vi oss ut på våra fina gräsplaner. Där kör vi på fram till sent in på hösten, då ställer vi in fotbollsskorna och kör inomhus igen fram till nästa säsong.

Man behöver inte ha någon förkunskap om fotboll eller ha spelat fotboll själv för att göra en stor nytta i en förening. Barn som vuxna, alla är välkomna och bidrar på sitt sätt. Så tveka inte, hör av er.'
where slug = 'fotboll';

update public.sections set
  heading = 'Orientering',
  intro   = 'En liten skara aktiva som åker på tävlingar, främst i närområdet.',
  body    = 'Orienteringssektionen har en liten skara aktiva som åker på tävlingar, främst i närområdet.

Har du frågor om orienteringen är du välkommen att höra av dig till Johan Ryding.'
where slug = 'orientering';

update public.sections set
  heading = 'Orientering barn och ungdom',
  intro   = 'Verksamheten återupptogs hösten 2023.',
  body    = 'Hösten 2023 återupptogs barn- och ungdomsverksamheten i orienteringen, under ledning av Emelie Gustafsson.

Är era barn sugna på att prova är ni välkomna att höra av er till henne.'
where slug = 'orientering-ungdom';

update public.sections set
  heading = 'Barngymnastik och Cirkelfys',
  intro   = 'Två pass i veckan för barn, och cirkelfys för vuxna och seniorer.',
  body    = 'Föreningen har barngymnastik två pass i veckan, inne i skolans gympasal. Det är två åldersgrupper: en med barn som är 3–5 år och en med barn som är 6–8 år.

I nuläget träffas seniorerna (55+) och tränar en gång i veckan, medan övriga vuxna tränar två gånger i veckan. Träningen består av en mix mellan konditionsträning och styrka, med eller utan lättare vikter.

Alla kan vara med, och fördelen är att man kan träna efter egen förmåga, beroende på dagsform och förutsättning. Alla är välkomna att prova! Är du 15 år eller yngre vill vi att du har en medföljande vuxens sällskap.'
where slug = 'gymnastik';

update public.sections set
  heading = 'Padel',
  intro   = 'En padelbana som alla får utnyttja. Bokas via Playtomic.',
  body    = 'Vi har en padelbana som alla får utnyttja. Vi ser såklart helst att alla som spelar är medlemmar i föreningen, men det är fritt för alla att boka.

Vi anordnar lite tävlingar och event med jämna mellanrum. Håll utkik!'
where slug = 'padel';

update public.sections set
  heading = 'Skidor',
  intro   = 'Elljusspåret spåras så fort snön tillåter.',
  body    = 'Så fort tillfälle ges spårar vi på elljusspåret, så att alla våra medlemmar kan ta del av det.

Vi önskar såklart att promenader med eller utan hund sker på sidan av dessa spår.'
where slug = 'skidor';
