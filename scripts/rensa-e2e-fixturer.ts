import { createClient } from "@supabase/supabase-js";

/**
 * Rensar E2E-fixturer ur den skarpa databasen.
 *
 * Testerna städar efter sig i beforeEach/afterEach, men ett hårt avbrott —
 * en avbruten CI-körning, en timeout, en runner som dör — hoppar över
 * afterEach, och då kan en publicerad "E2E:"-nyhet stå kvar synlig för
 * riktiga besökare tills någon råkar köra testerna igen. Det här steget
 * körs i CI med `if: always()`, så städningen sker även när testerna
 * kraschar eller avbryts.
 *
 * Fixturkonventionen: nyheter och händelser märks "E2E:" i rubriken,
 * bokningar med adressen e2e-uthyrning@example.com, spärrar med "E2E:" i
 * anledningen. Inget riktigt innehåll får någonsin se ut så.
 */
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const nyckel = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !nyckel) {
    console.log("rensa-e2e-fixturer: ingen service role-nyckel — inget att göra.");
    return;
  }

  const db = createClient(url, nyckel, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const steg: [string, () => PromiseLike<{ error: { message: string } | null }>][] = [
    ["nyheter", () => db.from("posts").delete().like("title", "E2E:%")],
    ["händelser", () => db.from("events").delete().like("title", "E2E:%")],
    ["bokningar", () => db.from("bookings").delete().eq("contact_email", "e2e-uthyrning@example.com")],
    ["spärrar", () => db.from("booking_blocks").delete().like("reason", "E2E:%")],
  ];

  let misslyckade = 0;
  for (const [namn, kor] of steg) {
    const { error } = await kor();
    if (error) {
      console.error(`rensa-e2e-fixturer: kunde inte rensa ${namn} — ${error.message}`);
      misslyckade++;
    }
  }

  if (misslyckade > 0) process.exit(1);
  console.log("rensa-e2e-fixturer: klart.");
}

main().catch((fel) => {
  console.error(fel);
  process.exit(1);
});
